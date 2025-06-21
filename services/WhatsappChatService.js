const WhatsappMediaApi = require("../api/Whatsapp/WhatsappMediaApi");
const WhatsappMessageApi = require("../api/Whatsapp/WhatsappMessageApi");
const { backendURI } = require("../config/app.config");
const WhatsappMessageChangeDto = require("../dtos/Whatsapp/WhatsappMessageChangeDto");
const WhatsappWebhookDto = require("../dtos/Whatsapp/WhatsappWebhookDto");
const ProfileNotFoundException = require("../exceptions/CustomExceptions/ProfileNotFoundException");
const SocketHelper = require("../helper/SocketHelper");
const ChatRepository = require("../repositories/ChatRepository");
const MessageRepository = require("../repositories/MessageRepository");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const { OPEN } = require("../types/chat-status.types");
const { INCOMING, OUTGOING } = require("../types/conversation-route.types");
const { PENDING } = require("../types/conversation-status.types");
const { TEXT, AUDIO, IMAGE, VIDEO, DOCUMENT } = require("../types/message.types");
const { getCurrentTimeStampInSeconds } = require("../utils/date.utils");
const { convertWebhookMessageToDBMessage } = require("../utils/messages.utils");
const { dataGet } = require("../utils/others.utils");
const ChatIOService = require("./ChatIOService");
const WhatsappMediaService = require("./WhatsappMediaService");


class WhatsappChatService {


  constructor(user = null, accessToken = null) {
    this.socialAccountRepository = new SocialAccountRepository();
    this.chatRepository = new ChatRepository();
    this.messageRepository = new MessageRepository();
    this.whatsappMediaApi = new WhatsappMediaApi();
    this.messageApi = new WhatsappMessageApi(user, accessToken);
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

  async processIncomingWebhook(payload) {
    const { entry } = payload;
    entry.forEach(async (entryObj) => {
      const webhookDto = new WhatsappWebhookDto(entryObj);

      const changes = webhookDto.getChanges();

      const account = await this.socialAccountRepository.findFirst({
        where: { social_account_id: webhookDto.getWabaId() }
      })

      if (!account) {
        throw new ProfileNotFoundException();
      }

      changes?.forEach(async (change) => {
        await this.processWebhookEntry(change, account);
      });


    });
  }

  async processWebhookEntry(messageObj, whatsappProfile) {
    try {
      let chatId = messageObj.getChatId();

      let chat = await this.chatRepository.findFirst({
        where: { chat_id: chatId, account_id: whatsappProfile.id }
      }, ["agentChat"]);

      if (!chat && !messageObj.isMessageEvent())
        return;

      if (!chat) {
        chat = await this.createNewChat(
          chatId,
          whatsappProfile,
          messageObj
        );
      }
      await this.initIOService(chat);

      if (messageObj.isMessageEvent()) {
        const messages = messageObj.getMessages();
        messages?.forEach(async (message) => {
          await this.processIncomingMessage(message, chat, whatsappProfile);
        });
      }
      else if (messageObj.isDeliveryStatus()) {
        const statuses = messageObj.getStatuses();
        statuses?.forEach((status) => {
          this.processDeliveryMessage(status);
        });
      }
    } catch (error) {
      console.log({
        error
      })
      return false;
    }
  }

  async createNewChat(chatId, whatsappProfile, messageObj) {

    const senderName = messageObj.getTargetName();
    const senderId = messageObj.getTargetPhoneNo();

    return this.chatRepository.createIfNotExists(
      {
        "chat_id": chatId,
        "avatar": "",
        "uid": whatsappProfile.uid,
        "account_id": whatsappProfile.id,
        "chat_note": "",
        "chat_tags": [],
        "sender_name": senderName,
        "sender_id": senderId,
        "chat_status": OPEN,
      },
      {
        chat_id: chatId,
        uid: whatsappProfile.uid
      }
    );
  }


  async processIncomingMessage(messageObj, chat, whatsappProfile) {
    const chatId = chat.id;

    if (messageObj.isTextMessage() || messageObj.hasAttachment()) {
      let dbMessageObj;
      if (messageObj.isTextMessage()) {
        dbMessageObj = convertWebhookMessageToDBMessage(messageObj);
      } else if (messageObj.hasAttachment()) {
        const attachmentId = messageObj.getAttachmentId();
        await this.whatsappMediaApi.initMeta();
        const attachmentUrl = await (new WhatsappMediaService(null, whatsappProfile.token))
          .downloadAndSaveMedia(attachmentId);
        messageObj.setAttachmentUrl(`${backendURI}/meta-media/${attachmentUrl}`);
        dbMessageObj = convertWebhookMessageToDBMessage(messageObj);
      }

      const message = await this.messageRepository.createIfNotExists(
        {
          ...dbMessageObj,
          uid: chat.uid,
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
        message.id,
        messageObj.getMessageTimestamp()
      );
      await this.emitUpdateConversationEvent(chat);
    }
    else if (messageObj.isReaction()) {
      await this.processReaction(messageObj);
    }
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

  async processDeliveryMessage(messageObj) {
    const mid = messageObj.getId();
    const status = messageObj.getStatus();
    const message = await this.messageRepository.updateConversationStatus(mid, status);
    this.emitMessageDeliveryEvent(message);
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

  async send(chat, { wabaId, senderId, text }) {

    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    const payload = {
      to: senderId,
      type: TEXT,
      text: {
        preview_url: true,
        body: text
      }
    };
    const result = await this.messageApi.send(payload);


    return this.storeMessage(chat, result, text);
  }

  async storeMessage(chat, apiResponse, text = "", attchment_url = "", type = TEXT) {

    const messageId = dataGet(apiResponse, "messages.0.id");



    return this.processOutgoingMessage({
      id: messageId,
      text,
      type,
      attchment_url,
      chat
    });
  }


  async processOutgoingMessage({
    id,
    text,
    type,
    chat,
    attchment_url
  }) {
    const chatId = chat.id;
    const timestamp = getCurrentTimeStampInSeconds();
    this.initIOService(chat);

    const message = await this.messageRepository.create(
      {
        timestamp,
        message_id: id,
        body: {
          text,
          attchment_url,
          reaction: "",
        },
        type,
        status: PENDING,
        uid: chat.uid,
        chat_id: chatId,
        route: OUTGOING,
      });

    this.emitNewMessageEvent(message, chatId);
    await this.chatRepository.updateLastMessage(
      chatId,
      message.id,
      timestamp
    );
    await this.emitUpdateConversationEvent(chat);
    return message;
  }


  async sendImage(chat, { wabaId, senderId, url, text }) {
    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    const result = await this.sendAttachment(wabaId, senderId, url, IMAGE, text);

    return this.storeMessage(chat, result, text, url, IMAGE);
  }

  async sendVideo(chat, { wabaId, senderId, url, text }) {
    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    const result = await this.sendAttachment(wabaId, senderId, url, VIDEO, text);

    return this.storeMessage(chat, result, text, url, VIDEO);
  }

  async sendDoc(chat, { wabaId, senderId, url, text }) {
    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    const result = await this.sendAttachment(wabaId, senderId, url, DOCUMENT, text);

    return this.storeMessage(chat, result, text, url, DOCUMENT);
  }

  async sendAudio(chat, { wabaId, senderId, url }) {

    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    const result = await this.sendAttachment(wabaId, senderId, url, AUDIO);

    return this.storeMessage(chat, result, null, url, AUDIO);

  }

  async sendAttachment(wabaId, senderId, url, type, caption = undefined) {
    await this
      .messageApi
      .setWabaId(wabaId)
      .initMeta();

    const payload = {
      to: senderId,
      type,
      [type]: {
        link: url,
        caption
      }
    };
    return this.messageApi.send(payload);
  }

};


module.exports = WhatsappChatService
