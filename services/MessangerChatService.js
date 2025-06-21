const PageNotFoundException = require("../exceptions/CustomExceptions/PageNotFoundException");
const ChatRepository = require("../repositories/ChatRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const {
  convertWebhookMessageToDBMessage,
} = require("../utils/messages.utils");
const ChatIOService = require("./ChatIOService");
const MessengerProfileApi = require("../api/Messanger/MessengerProfileApi");
const MessengerMessageApi = require("../api/Messanger/MessengerMessageApi");
const { DELIVERED, READ, SENT } = require("../types/broadcast-delivery-status.types");
const { VIDEO, FILE, AUDIO } = require("../types/message.types");
const ConversationRepository = require("../repositories/MessageRepository");
const SocketHelper = require("../helper/SocketHelper");
const MessengerWebhookDto = require("../dtos/Messenger/MessengerWebhookDto");
const MessageRepository = require("../repositories/MessageRepository");
const { INCOMING, OUTGOING } = require("../types/conversation-route.types");
const { OPEN } = require("../types/chat-status.types");

class MessangerChatService {

  constructor(user = null, accessToken = null) {
    this.pageRepository = new FacebookPageRepository();
    this.chatRepository = new ChatRepository();
    this.conversationRepository = new ConversationRepository();
    this.profileApi = new MessengerProfileApi(user, accessToken);
    this.messageApi = new MessengerMessageApi(user, accessToken);
    this.messageRepository = new MessageRepository();
  }

  async initIOService(chat) {




    this.socketHelper = new SocketHelper();
    const chatAgent = chat.agentChat ?? null;

    if (chat?.uid) {
      const userRoom = new ChatIOService(chat.uid);
      await userRoom.initSocket();
      this.socketHelper.setUserRoom(userRoom);
    }

    if (chatAgent?.uid) {
      const agentRoom = new ChatIOService(chatAgent.uid);
      await agentRoom.initSocket();
      this.socketHelper.setAgentRoom(agentRoom);
    }


  }

  async processIncomingMessages(payload) {
    const { object, entry } = payload;
    entry.forEach((entryObj) => {

      const webhookDto = new MessengerWebhookDto(entryObj);

      if (webhookDto.isMessage()) {
        const messages = webhookDto.getMessages();
        messages?.forEach(async (messageObj) => {
          await this.processWebhookEntry(messageObj);
        });
      }


    });
  }

  async processWebhookEntry(messageObj) {


    let ownerId = messageObj.getOwnerId();

    let chatId = messageObj.getChatId();

    let facebookPage = await this.pageRepository.findFirst({
      where: { page_id: ownerId }
    }, ["account"]);

    if (!facebookPage) {
      throw new PageNotFoundException();
    }


    let chat = await this.chatRepository.findFirst({
      where: { chat_id: chatId, page_id: facebookPage.id }
    }, ["agentChat"]);

    if (!chat) {
      chat = await this.createNewChat(
        chatId,
        facebookPage,
        messageObj
      );
    }



    await this.initIOService(chat);

    if (messageObj.isDeliveryReceipt()) {
      await this.processDeliveryReciept(messageObj, chat);
    } else if (messageObj.isMessage()) {
      await this.processIncomingMessage(messageObj, chat);
    } else if (messageObj.isReaction()) {
      await this.processReaction(messageObj);
    } else if (messageObj.isDeliveryEvent() || messageObj.isReadEvent()) {
      await this.processDeliveryMessage(messageObj, chat);
    }

    await this.emitUpdateConversationEvent(chat);
  }

  async createNewChat(chatId, facebookPage, messageObj) {

    const senderId = messageObj.getTargetId();

    await this.profileApi.initMeta();

    const {
      first_name,
      last_name,
      profile_pic,
      id
    } = await this.profileApi.setToken(facebookPage.token).fetchProfile(senderId);



    return this.chatRepository.createIfNotExists(
      {
        "chat_id": chatId,
        "avatar": profile_pic,
        "uid": facebookPage.uid,
        "account_id": facebookPage.account.id,
        "page_id": facebookPage.id,
        "chat_note": "",
        "chat_tags": [],
        "sender_name": `${first_name} ${last_name}`,
        "sender_id": senderId,
        "chat_status": OPEN,
      },
      {
        chat_id: chatId,
        uid: facebookPage.uid
      }
    );
  }

  async processDeliveryReciept(messageObj, chat) {
    const chatId = chat.id;

    const dbMessageObj = convertWebhookMessageToDBMessage(messageObj);

    const message = await this.messageRepository.createIfNotExists(
      {
        ...dbMessageObj,
        uid: chat.uid,
        owner_id: chat.uid,
        chat_id: chatId,
        route: OUTGOING,
      },
      {
        message_id: messageObj.getId(),
        chat_id: chatId,
      }
    );

    this.emitNewMessageEvent(message, chatId);
    await this.chatRepository.updateLastMessage(
      chatId,
      message.id
    );
  }

  async processIncomingMessage(messageObj, chat) {
    const chatId = chat.id;
    const dbMessageObj = convertWebhookMessageToDBMessage(messageObj);
    const message = await this.messageRepository.createIfNotExists(
      {
        ...dbMessageObj,
        uid: chat.uid,
        owner_id: chat.uid,
        chat_id: chatId,
        route: INCOMING,
      },
      {
        message_id: messageObj.getId(),
        chat_id: chatId,
      }
    );
    this.emitNewMessageEvent(message, chatId);
    await this.chatRepository.updateLastMessage(
      chatId,
      message.id
    );
  }

  async processReaction(messageObj) {
    const mid = messageObj.getId();

    let message = await this.messageRepository.findByMessageId(mid);

    if (!message) return;

    const { body } = message;


    message = await this.messageRepository.updateBody(mid, {
      ...body,
      reaction: messageObj.getEmoji(),
    });
    
    this.emitNewReactionEvent(message);
  }

  async processDeliveryMessage(messageObj, chat) {

    let status = SENT;
    if (messageObj.isDeliveryEvent()) {
      status = DELIVERED;
      const deliveryObj = messageObj.getDeliveryEventObj();
      const mids = deliveryObj.mids;
      mids.forEach(async (mid) => {
        const message = await this.messageRepository.updateConversationStatus(mid, status);
        this.emitMessageDeliveryEvent(message);
      });
    } else if (messageObj.isReadEvent()) {
      const messages = await this.messageRepository.setConversationToRead(chat.id);
      messages.forEach((message) => {
        this.emitMessageDeliveryEvent(message);
      });
    }
  }

  async send({ text, senderId }) {
    await this.messageApi.initMeta();
    const payload = {
      recipient: { id: senderId },
      message: { text },
      messaging_type: "RESPONSE",
    };
    return this.messageApi.sendMessage(payload);
  }

  async sendImage({ senderId, url }) {
    return this.sendAttachment(url, IMAGE, senderId);
  }

  async sendVideo({ senderId, url }) {
    return this.sendAttachment(url, VIDEO, senderId);
  }

  async sendDoc({ senderId, url }) {
    return this.sendAttachment(url, FILE, senderId);
  }

  async sendAudio({ senderId, url }) {
    return this.sendAttachment(url, AUDIO, senderId);
  }

  async sendAttachment(url, type, senderId) {
    await this.messageApi.initMeta();
    const payload = {
      recipient: { id: senderId },
      message: {
        attachment: {
          type,
          payload: {
            url,
          },
        },
      },
    };
    return this.messageApi.sendMessage(payload);
  }

  async emitUpdateConversationEvent(chat) {

    const userChats = await this.chatRepository.findInboxChats(chat.uid);
    this.socketHelper.pushUserChats(userChats);

    const agentChat = chat.agentChat ?? null;

    if (agentChat) {
      const agentChats = await this.agentChatRepository.find({ uid: agentChat.uid });
      const chats = agentChats.map((i) => i?.chat);
      this.socketHelper.pushAgentChats(chats);
    }
  }

  async emitNewMessageEvent(message) {
    this.socketHelper.pushNewMsg(message);
  }

  async emitNewReactionEvent(message) {
    this.socketHelper.pushNewReaction(message);
  }

  async emitMessageDeliveryEvent(message) {
    this.socketHelper.pushUpdateDelivery(message);
  }
};


module.exports = MessangerChatService