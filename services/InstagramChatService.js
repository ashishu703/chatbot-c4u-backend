const FacebookException = require("../../exceptions/FacebookException");
const {
  readJsonFromFile,
  writeJsonToFile,
  addObjectToFile,
} = require("../../functions/function");
const ChatRepository = require("../../repositories/chatRepository");
const InstagramAccountRepository = require("../../repositories/InstagramAccountRepository");
const AgentChatRepository = require("../../repositories/AgentChatRepository");
const { prepareChatPath, createChatId } = require("../../utils/facebook.utils");
const {
  convertWebhookReciveMessageToJsonObj,
  convertInstagramWebhookToDBChatCreateObject,
  convertWebhookToDBChatUpdateObject,
  convertWebhookRecieptToJsonObj,
} = require("../../utils/messenger.utils");
const ChatIOService = require("../ChatIOService");
const InstagramProfileService = require("./InstagramProfileService");
const InstagramService = require("./InstagramService");
const ProfileNotFoundException = require("../../exceptions/CustomExceptions/ProfileNotFoundException");

module.exports = class InstagramChatService extends InstagramService {
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

  async processIncomingWebhook(payload) {
    const { entry } = payload;
    entry.forEach((entryObj) => {
      const { messaging, changes } = entryObj;
      messaging?.forEach(async (messageObj) => {
        await this.processWebhookEntry(messageObj);
      });
      changes?.forEach(async (change) => {
        await this.processChanges(change);
      });
    });
  }

  async processWebhookEntry(messageObj) {
    try {
      const { recipient, sender, message, reaction } = messageObj;
      let instagramProfile;
      let chatId;

      if (message && message.is_echo) {
        chatId = createChatId(recipient.id, sender.id);
        instagramProfile =
          await InstagramAccountRepository.findByInstagramUserId(sender.id);
      } else {
        chatId = createChatId(sender.id, recipient.id);
        instagramProfile =
          await InstagramAccountRepository.findByInstagramUserId(recipient.id);
      }

      const existingChat = await ChatRepository.findChatByChatId(chatId);
      if (!existingChat) {
        await this.createNewChat({
          ...messageObj,
          chatId,
          ...instagramProfile,
        });
      }

      if (!instagramProfile) {
        throw new ProfileNotFoundException();
      }

      await this.initIOService(chatId);
      const path = prepareChatPath(instagramProfile.uid, chatId);

      messageObj = { ...messageObj, ...instagramProfile, path, chatId };

      if (message && message.is_echo) {
        this.processSentReciept(messageObj);
      } else if (message) {
        this.processIncomingMessage(messageObj);
      } else if (reaction) {
        this.processReaction(messageObj);
      }

      await this.emitUpdateConversationEvent(chatId);
    } catch (error) {
      console.log(error);
      return false;
    }
  }

  async processChanges(change) {
    try {
      const { field, value } = change;
      if (field === "messaging_seen") {
        const { sender, recipient } = value;
        const instagramProfile =
          await InstagramAccountRepository.findByInstagramUserId(recipient.id);
        const chatId = createChatId(sender.id, recipient.id);

        if (!instagramProfile) {
          throw new ProfileNotFoundException();
        }

        await this.initIOService(chatId);
        const path = prepareChatPath(instagramProfile.uid, chatId);

        change = { ...value, ...instagramProfile, path, chatId };
        this.processDeliveryMessage(change);

        await this.emitUpdateConversationEvent(chatId);
      }
    } catch (error) {
      return false;
    }
  }

  async createNewChat(messageObj) {
    const profileService = new InstagramProfileService(null, messageObj.token);
    await profileService.initMeta();
    const { from } = await profileService.fetchProfileByMessage(
      messageObj.message.mid
    );
    await ChatRepository.createIfNotExist(
      convertInstagramWebhookToDBChatCreateObject({
        ...messageObj,
        username: from.username,
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

  async processIncomingMessage(messageObj) {
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
    const { path, chatId, read } = messageObj;
    const chats = readJsonFromFile(path);
    const updatedChat = [];
    for (let index = 0; index < chats.length; index++) {
      const chat = chats[index];
      if (read) {
        chat.status = "read";
        this.emitMessageDeliveryEvent(chat, chatId);
        if (read.mid == chat.message_id) {
          break;
        }
      }
      updatedChat.push(chat);
    }
    writeJsonToFile(path, updatedChat, null);
  }

  async send({ text, toNumber }) {
    const payload = { recipient: { id: toNumber }, message: { text } };
    return this.post("/me/messages", payload, {
      access_token: this.accessToken,
    });
  }

  async sendAttachment(url, type, toNumber) {
    const payload = {
      recipient: { id: toNumber },
      message: { attachment: { type, payload: { url } } },
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
