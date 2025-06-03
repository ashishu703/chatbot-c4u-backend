const PageNotFoundException = require("../../exceptions/CustomExceptions/PageNotFoundException");
const ChatRepository = require("../repositories/ChatRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const { createChatId } = require("../utils/facebook.utils");
const {
  convertWebhookReciveMessageToJsonObj,
  convertMessangerWebhookToDBChatCreateObject,
  convertWebhookToDBChatUpdateObject,
  convertWebhookRecieptToJsonObj,
} = require("../utils/messenger.utils");
const ChatIOService = require("../ChatIOService");
const { USER, AGENT } = require("../types/roles.types");
const MessengerProfileApi = require("../api/Messanger/MessengerProfileApi");
const MessengerProfileApi = require("../api/Messanger/MessengerMessageApi");
const { DELIVERED, READ, SENT } = require("../types/chat-status.types");
const { VIDEO, FILE, AUDIO } = require("../types/message.types");
const ConversationRepository = require("../repositories/ConversationRepository");

class MessangerChatService {

  constructor(user = null, accessToken = null) {
    this.pageRepository = new FacebookPageRepository();
    this.chatRepository = new ChatRepository();
    this.conversationRepository = new ConversationRepository();
    this.profileApi = new MessengerProfileApi();
    this.messageApi = new MessengerMessageApi();
  }

  async initIOService(chatId) {
    this.agentIoService = null;
    this.userIoService = null;

    const chat = await this.this.chatRepository.findChatByChatId(chatId);
    const chatAgent = await this.this.chatRepository.getAssignedAgent(chatId);

    if (chat?.uid) {
      this.userIoService = new ChatIOService(chat.uid);
      await this.userIoService.initSocket();
    }

    if (chatAgent?.uid) {
      this.agentIoService = new ChatIOService(chatAgent.uid);
      await this.agentIoService.initSocket();
    }
  }

  async processIncomingMessages(payload) {
    const { object, entry } = payload;
    entry.forEach((entryObj) => {
      const { messaging } = entryObj;
      messaging.forEach(async (messageObj) => {
        const { recipient, sender, message, reaction, delivery, read } =
          messageObj;

        let pageProfile;
        let chatId;

        if (message && message.is_echo) {
          pageProfile = await this.pageRepository.findByPageId(sender.id);
          chatId = createChatId(recipient.id, sender.id);
        } else {
          pageProfile = await this.pageRepository.findByPageId(recipient.id);
          chatId = createChatId(sender.id, recipient.id);
          const existingChat = await this.chatRepository.findByChatId(chatId);
          if (!existingChat) {
            await this.createNewChat({ ...messageObj, ...pageProfile, chatId });
          }
        }

        if (!pageProfile) {
          throw new PageNotFoundException();
        }

        await this.initIOService(chatId);


        messageObj = {
          ...messageObj,
          ...pageProfile,
          chatId,
        };

        if (message && message.is_echo) {
          this.processSentReciept(messageObj);
        } else if (message) {
          this.processTextMessage(messageObj);
        } else if (reaction) {
          this.processReaction(messageObj);
        } else if (delivery || read) {
          this.processDeliveryMessage(messageObj);
        }

        await this.emitUpdateConversationEvent(chatId);
      });
    });
  }

  async createNewChat(messageObj) {
    const message = messageObj.message;
    await this.profileApi.setToken(messageObj.token).initMeta();
    const person = await this.profileApi.fetchProfile(message.mid);

    await this.chatRepository.createIfNotExists(
      convertMessangerWebhookToDBChatCreateObject({
        ...messageObj,
        ...{
          first_name: person.from.name,
          last_name: "",
          profile_pic: "",
        },
      })
    );

    await this.conversationRepository.createIfNotExists(messageObj);
  }

  async processSentReciept(messageObj) {
    const { chatId } = messageObj;
    const dbMessageObj = convertWebhookRecieptToJsonObj(messageObj);
    await this.conversationRepository.createIfNotExists(messageObj);
    this.emitNewMessageEvent(dbMessageObj, chatId);
    await this.chatRepository.updateLastMessage(
      chatId,
      convertWebhookToDBChatUpdateObject({
        ...messageObj,
        message: dbMessageObj,
      })
    );
  }

  async processTextMessage(messageObj) {
    const { chatId } = messageObj;
    const dbMessageObj = convertWebhookReciveMessageToJsonObj(messageObj);
    this.emitNewMessageEvent(dbMessageObj, chatId);
    await this.conversationRepository.createIfNotExists(messageObj);
    await this.chatRepository.updateLastMessage(
      chatId,
      convertWebhookToDBChatUpdateObject({
        ...messageObj,
        message: dbMessageObj,
      })
    );
  }

  async processReaction(messageObj) {
    const { reaction, mid } = messageObj;
    const message = await this.conversationRepository.updateConversationReaction(mid, reaction);
    this.emitNewReactionEvent(message, chatId);
  }

  async processDeliveryMessage(messageObj) {
    const { mid, delivery, read, chatId } = messageObj;
    let status = SENT;
    if (delivery && delivery.mids.includes(chat.message_id)) {
      status = DELIVERED;
    } else if (read) {
      status = READ;
    }

    const message = await this.conversationRepository.updateConversationStatus(mid, reaction);
    this.emitMessageDeliveryEvent(message, chatId);

  }

  async send({ text, toNumber }) {
    const payload = {
      recipient: { id: toNumber },
      message: { text },
      messaging_type: "RESPONSE",
    };
    return this.messageApi.sendMessage(payload);
  }

  async sendImage({ toNumber, url }) {
    return this.sendAttachment(url, IMAGE, toNumber);
  }

  async sendVideo({ toNumber, url }) {
    return this.sendAttachment(url, VIDEO, toNumber);
  }

  async sendDoc({ toNumber, url }) {
    return this.sendAttachment(url, FILE, toNumber);
  }

  async sendAudio({ toNumber, url }) {
    return this.sendAttachment(url, AUDIO, toNumber);
  }

  async sendAttachment(url, type, toNumber) {
    const payload = {
      recipient: { id: toNumber },
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

  async emitUpdateConversationEvent(chatId) {
    const chat = await this.chatRepository.findChatByChatId(chatId);
    const chats = await this.chatRepository.findUidId(chat.uid);

    this.executeSocket(
      "updateConversation",
      {
        chats,
      },
      USER
    );
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


module.exports = MessangerChatService