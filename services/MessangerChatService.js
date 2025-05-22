const PageNotFoundException = require("../../exceptions/CustomExceptions/PageNotFoundException");
const FacebookException = require("../../exceptions/FacebookException");
const {
  readJsonFromFile,
  writeJsonToFile,
  addObjectToFile,
} = require("../../functions/function");
const AgentChatRepository = require("../../repositories/AgentChatRepository");
const ChatRepository = require("../../repositories/chatRepository");
const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const FacebookProfileRepository = require("../../repositories/FacebookProfileRepository");
const { prepareChatPath, createChatId } = require("../../utils/facebook.utils");
const {
  convertWebhookReciveMessageToJsonObj,
  convertMessangerWebhookToDBChatCreateObject,
  convertWebhookToDBChatUpdateObject,
  convertWebhookRecieptToJsonObj,
} = require("../../utils/messenger.utils");
const ChatIOService = require("../ChatIOService");
const MessangerPageService = require("./MessangerPageService");
const MessangerService = require("./MessangerService");

module.exports = class MessangerChatService extends MessangerService {
  pageService;
  agentIoService = null;
  userIoService = null;
  constructor(user = null, accessToken = null) {
    super(user, accessToken);
  }

  async initIOService(chatId) {
    this.agentIoService = null;
    this.userIoService = null;

    const chat = await ChatRepository.findChatByChatId(chatId);
    const chatAgent = await AgentChatRepository.getAssignedAgent(chatId);

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
          pageProfile = await FacebookPageRepository.findByPageId(sender.id);
          chatId = createChatId(recipient.id, sender.id);
        } else {
          pageProfile = await FacebookPageRepository.findByPageId(recipient.id);
          chatId = createChatId(sender.id, recipient.id);
          const existingChat = await ChatRepository.findChatByChatId(chatId);
          if (!existingChat) {
            await this.createNewChat({ ...messageObj, ...pageProfile, chatId });
          }
        }

        if (!pageProfile) {
          throw new PageNotFoundException();
        }

        await this.initIOService(chatId);

        const path = prepareChatPath(pageProfile.uid, chatId);

        messageObj = {
          ...messageObj,
          ...pageProfile,
          path,
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
    const pageService = new MessangerPageService(null, messageObj.token);
    await pageService.initMeta();
    const person = await pageService.fetchProfile(message.mid);
    await ChatRepository.createIfNotExist(
      convertMessangerWebhookToDBChatCreateObject({
        ...messageObj,
        ...{
          first_name: person.from.name,
          last_name: "",
          profile_pic: "",
        },
      })
    );
  }

  async processSentReciept(messageObj) {
    const { path, chatId } = messageObj;
    const dbMessageObj = convertWebhookRecieptToJsonObj(messageObj);
    addObjectToFile(dbMessageObj, path);
    this.emitNewMessageEvent(dbMessageObj, chatId);
    await ChatRepository.updateLastMessage(
      chatId,
      convertWebhookToDBChatUpdateObject({
        ...messageObj,
        message: dbMessageObj,
      })
    );
  }

  async processTextMessage(messageObj) {
    const { path, chatId } = messageObj;
    const dbMessageObj = convertWebhookReciveMessageToJsonObj(messageObj);
    addObjectToFile(dbMessageObj, path);
    this.emitNewMessageEvent(dbMessageObj, chatId);
    await ChatRepository.updateLastMessage(
      chatId,
      convertWebhookToDBChatUpdateObject({
        ...messageObj,
        message: dbMessageObj,
      })
    );
  }

  async processReaction(messageObj) {
    const { reaction, chatId, path } = messageObj;
    const chats = readJsonFromFile(path);
    let foundMessage;
    const updatedChat = chats.map((chat) => {
      if (chat.message_id === reaction.mid) {
        chat.reaction = reaction.emoji;
        foundMessage = chat;
      }
      return chat;
    });
    if (foundMessage) {
      this.emitNewReactionEvent(foundMessage, chatId);
      await ChatRepository.updateLastMessage(
        chatId,
        convertWebhookToDBChatUpdateObject({
          ...messageObj,
          message: foundMessage,
        })
      );
    }
    writeJsonToFile(path, updatedChat, null);
  }

  async processDeliveryMessage(messageObj) {
    const { path, chatId, delivery, read } = messageObj;
    const chats = readJsonFromFile(path);

    const updatedChat = chats.map((chat) => {
      if (delivery && delivery.mids.includes(chat.message_id)) {
        chat.status = "delivered";
        this.emitMessageDeliveryEvent(chat, chatId);
      } else if (read) {
        chat.status = "read";
        this.emitMessageDeliveryEvent(chat, chatId);
      }
      return chat;
    });
    writeJsonToFile(path, updatedChat, null);
  }

  async send({ text, toNumber }) {
    const payload = {
      recipient: { id: toNumber },
      message: { text },
      messaging_type: "RESPONSE",
    };
    return this.post("/me/messages", payload, {
      access_token: this.accessToken,
    });
  }

  async sendImage({ toNumber, url }) {
    return this.sendAttachment(url, "image", toNumber);
  }

  async sendVideo({ toNumber, url }) {
    return this.sendAttachment(url, "video", toNumber);
  }

  async sendDoc({ toNumber, url }) {
    return this.sendAttachment(url, "file", toNumber);
  }

  async sendAudio({ toNumber, url }) {
    return this.sendAttachment(url, "audio", toNumber);
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

    return this.post("/me/messages", payload, {
      access_token: this.accessToken,
    });
  }

  async emitUpdateConversationEvent(chatId) {
    const chat = await ChatRepository.findChatByChatId(chatId);
    const chats = await ChatRepository.findUidId(chat.uid);
    const agentChat = await AgentChatRepository.getAssignedAgent(chatId);

    this.executeSocket(
      "updateConversation",
      {
        chats,
      },
      "user"
    );

    if (agentChat) {
      const agentChats = await AgentChatRepository.getAgentChats(agentChat.uid);
      const chatIds = agentChats.map((i) => i?.chat_id);
      const chats = await ChatRepository.searchByChatIds(chatIds);
      this.executeSocket(
        "updateConversation",
        {
          chats,
        },
        "agent"
      );
    }
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
    if (target === "both" || target === "user") {
      if (this.userIoService) {
        this.userIoService[action](payload);
      }
    }
    if (target === "both" || target === "agent") {
      if (this.agentIoService) {
        this.agentIoService[action](payload);
      }
    }
  }
};
