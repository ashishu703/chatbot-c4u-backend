
const { createChatId } = require("../utils/facebook.utils");
const {
  convertWebhookReciveMessageToJsonObj,
  convertInstagramWebhookToDBChatCreateObject,
  convertWebhookToDBChatUpdateObject,
  convertWebhookMessageToDBMessage,
} = require("../utils/messages.utils");
const ChatIOService = require("./IOService");
const ProfileNotFoundException = require("../exceptions/CustomExceptions/ProfileNotFoundException");
const ChatRepository = require("../repositories/ChatRepository");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const InstagramProfileApi = require("../api/Instagram/InstagramProfileApi");
const MessageRepository = require("../repositories/MessageRepository");
const { OPEN } = require("../types/chat-status.types");
const { USER, AGENT } = require("../types/roles.types");
const InstagramMessageApi = require("../api/Instagram/InstagramMessageApi");
const InstagramWebhookDto = require("../dtos/Instagram/InstagramWebhookDto");
const { DELIVERED, READ } = require("../types/conversation-status.types");
const { OUTGOING, INCOMING } = require("../types/conversation-route.types");

class InstagramChatService {


  constructor(user = null, accessToken = null) {
    this.chatRepository = new ChatRepository();
    this.agentIoService = new ChatIOService();
    this.socialAccountRepository = new SocialAccountRepository();
    this.instagramProfileApi = new InstagramProfileApi(user, accessToken);
    this.instagramMessageApi = new InstagramMessageApi(user, accessToken);
    this.messageRepository = new MessageRepository();
  }

  async initIOService(chat) {
    this.agentIoService = null;
    this.userIoService = null;


    const chatAgent = chat.agentChat ?? null;

    if (chat?.uid) {
      this.userIoService = new ChatIOService(chat.uid);
      await this.userIoService.initSocket();
    }

    if (chatAgent?.uid) {
      this.agentIoService = new ChatIOService(chatAgent.uid);
      await this.agentIoService.initSocket();
    }
  }

  async processIncomingWebhook(payload) {
    const { entry } = payload;
    entry.forEach((entryObj) => {
      const webhookDto = new InstagramWebhookDto(entryObj);

      if (webhookDto.isMessage()) {
        const messages = webhookDto.getMessages();

        messages?.forEach(async (messageObj) => {
          await this.processWebhookEntry(messageObj);
        });
      }

      if (webhookDto.isChange()) {
        const changes = webhookDto.getChanges();
        changes?.forEach(async (change) => {
          await this.processChanges(change);
        });
      }
    });
  }

  async processWebhookEntry(messageObj) {
    try {


      let ownerId = messageObj.getOwnerId();

      let chatId = messageObj.getChatId();

      let instagramProfile =
        await this.socialAccountRepository.findFirst({
          where: { social_user_id: ownerId }
        });


      if (!instagramProfile) {
        throw new ProfileNotFoundException();
      }



      let chat = await this.chatRepository.findFirst({
        where: { chat_id: chatId, account_id: instagramProfile.id }
      }, ["agentChat"]);

      if (!chat) {
        chat = await this.createNewChat(
          chatId,
          instagramProfile,
          messageObj
        );
      }



      await this.initIOService(chat);


      if (messageObj.isDeliveryReceipt()) {
        this.processDeliveryReciept(messageObj, chat);
      } else if (messageObj.isMessage()) {
        this.processIncomingMessage(messageObj, chat);
      } else if (messageObj.isReaction()) {
        this.processReaction(messageObj, chat);
      }

      await this.emitUpdateConversationEvent(chat);
    } catch (error) {
      console.log({
        error
      })
      return false;
    }
  }

  async processChanges(change) {
    try {
      if (change.isMessageSeenEvent()) {
        const sender = change.getSenderId();
        const instagramProfile = await this.socialAccountRepository.findFirst({
          social_user_id: sender
        });


        if (!instagramProfile) {
          throw new ProfileNotFoundException();
        }

        const chatId = change.getChatId();

        const chat = await this.chatRepository.findFirst({
          where: { chat_id: change.getChatId(), account_id: instagramProfile.id }
        }, ["agentChat"]);


        await this.initIOService(chat);

        this.processDeliveryMessage(change, chat);

        await this.emitUpdateConversationEvent(chatId);
      }
    } catch (error) {
      return false;
    }
  }

  async createNewChat(chatId, instagramProfile, messageObj) {

    const senderId = messageObj.getTargetId();
    await this.instagramProfileApi.initMeta();
    const {
      name,
      profile_pic
    } = await this.instagramProfileApi.setToken(instagramProfile.token)
      .fetchProfile(senderId);


    return this.chatRepository.createIfNotExists(
      {
        "chat_id": chatId,
        "avatar": profile_pic,
        "uid": instagramProfile.uid,
        "account_id": instagramProfile.id,
        "last_message_came": messageObj.getMessageTimestamp(),
        "chat_note": "",
        "chat_tags": "",
        "sender_name": name,
        "sender_id": senderId,
        "chat_status": OPEN,
      },
      {
        chat_id: chatId,
        uid: instagramProfile.uid
      }
    );
  }

  async processDeliveryReciept(messageObj, chat) {
    const chatId = chat.id;

    const dbMessageObj = convertWebhookMessageToDBMessage(messageObj);

    const message = await this.messageRepository.create(
      {
        ...dbMessageObj,
        uid: chat.uid,
        owner_id: chat.uid,
        chat_id: chatId,
        route: OUTGOING,
      });
 
    this.emitNewMessageEvent(dbMessageObj, chatId);
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
        message_id: dbMessageObj.getId(),
        chat_id: chatId,
      }
    );
    this.emitNewMessageEvent(dbMessageObj, chatId);
    await this.chatRepository.updateLastMessage(
      chatId,
      message.id
    );
  }

  async processReaction(messageObj) {
    const mid = messageObj.getId();
    const mesasge = await this.messageRepository.update({
      reaction: messageObj.reaction.emoji,
    }, {
      message_id: mid
    });
    this.emitNewReactionEvent(mesasge, chatId);

  }

  async processDeliveryMessage(messageObj) {
    const mid = messageObj.getId();
    return this.messageRepository.updateConversationStatus(mid, READ);
  }

  async send({ text, toNumber }) {
    const payload = { recipient: { id: toNumber }, message: { text } };
    return this.instagramMessageApi.sendMessage(payload);
  }

  async sendAttachment(url, type, toNumber) {
    const payload = {
      recipient: { id: toNumber },
      message: { attachment: { type, payload: { url } } },
    };
    return this.instagramMessageApi.sendMessage(payload);
  }

  async emitUpdateConversationEvent(chat) {
    const chats = await this.chatRepository.findByUid(chat.uid);
    // const agentChat = await AgentChatRepository.getAssignedAgent(chat.uid);

    this.executeSocket(
      "updateConversation",
      {
        chats,
      },
      USER
    );

    // if (agentChat) {
    //   const agentChats = await AgentChatRepository.getAgentChats(agentChat.uid);
    //   const chatIds = agentChats.map((i) => i?.chat_id);
    //   const chats = await this.chatRepository.searchByChatIds(chatIds);
    //   this.executeSocket(
    //     "updateConversation",
    //     {
    //       chats,
    //     },
    //     AGENT
    //   );
    // }
  }

  async emitNewMessageEvent(message, chatId) {
    const payload = { msg: message, chatId };
    this.executeSocket("pushNewMsg", payload, "both");
  }

  async emitNewReactionEvent(message, chatId) {
    const payload = {
      chatId,
      reaction: message.reaction,
      message_id: message.message_id,
    };
    this.executeSocket("pushNewReaction", payload, "both");
  }

  async emitMessageDeliveryEvent({ message_id, status }, chatId) {
    const payload = { message_id, status, chatId };
    this.executeSocket("pushUpdateDelivery", payload, "both");
  }

  async executeSocket(action, payload, target = "both") {
    if (target === "both" || target === USER) {
      if (this.userIoService) {
        this.userIoService[action](payload);
      }
    }
    if (target === "both" || target === AGENT) {
      if (this.agentIoService) {
        this.agentIoService[action](payload);
      }
    }
  }
};


module.exports = InstagramChatService
