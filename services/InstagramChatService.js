
const { createChatId } = require("../utils/facebook.utils");
const {
  convertWebhookReciveMessageToJsonObj,
  convertInstagramWebhookToDBChatCreateObject,
  convertWebhookToDBChatUpdateObject,
  convertWebhookRecieptToJsonObj,
} = require("../utils/messenger.utils");
const ChatIOService = require("./IOService");
const ProfileNotFoundException = require("../../exceptions/CustomExceptions/ProfileNotFoundException");
const ChatRepository = require("../repositories/ChatRepository");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const InstagramProfileApi = require("../api/Instagram/InstagramProfileApi");
const ConversationRepository = require("../repositories/ConversationRepository");
const { READ } = require("../types/chat-status.types");
const { USER, AGENT } = require("../types/roles.types");
const InstagramMessageApi = require("../api/Instagram/InstagramMessageApi");

class InstagramChatService {


  constructor(user = null, accessToken = null) {
    super(user, accessToken);
    this.instagramApi = new InstagramApi(user, accessToken);
    this.chatRepository = new ChatRepository();
    this.agentIoService = new ChatIOService();
    this.socialAccountRepository = new SocialAccountRepository();
    this.instagramProfileApi = new InstagramProfileApi(user, accessToken);
    this.instagramMessageApi = new InstagramMessageApi(user, accessToken);
    this.conversationRepository = new ConversationRepository();
  }

  async initIOService(chatId) {
    this.agentIoService = null;
    this.userIoService = null;

    const chat = await this.chatRepository.findByChatId(chatId);
    const chatAgent = await this.chatRepository.getAssignedAgent(chatId);

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
          await this.socialAccountRepository.findFirst({
            social_user_id: recipient.id
          });
      } else {
        chatId = createChatId(sender.id, recipient.id);
        instagramProfile =
          await this.socialAccountRepository.findFirst({
            social_user_id: recipient.id
          });
      }

      const existingChat = await this.chatRepository.findByChatId(chatId);
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

      messageObj = { ...messageObj, ...instagramProfile, chatId };

      if (message && message.is_echo) {
        this.processSentReciept(messageObj);
      } else if (message) {
        this.processIncomingMessage(messageObj);
      } else if (reaction) {
        this.processReaction(messageObj);
      }

      await this.emitUpdateConversationEvent(chatId);
    } catch (error) {
      return false;
    }
  }

  async processChanges(change) {
    try {
      const { field, value } = change;
      if (field === "messaging_seen") {
        const { sender, recipient } = value;
        const instagramProfile = await this.socialAccountRepository.findFirst({
          social_user_id: recipient.id
        });

        const chatId = createChatId(sender.id, recipient.id);

        if (!instagramProfile) {
          throw new ProfileNotFoundException();
        }

        await this.initIOService(chatId);

        change = { ...value, ...instagramProfile, path, chatId };
        this.processDeliveryMessage(change);

        await this.emitUpdateConversationEvent(chatId);
      }
    } catch (error) {
      return false;
    }
  }

  async createNewChat(messageObj) {

    const {
      name,
      username,
      profile_pic
    } = this.instagramProfileApi.initMeta()
      .setToken(messageObj.token)
      .fetchProfile(messageObj.sender.id);

    await this.chatRepository.createIfNotExists(
      convertInstagramWebhookToDBChatCreateObject({
        ...messageObj,
        username: username,
        name: name,
        avatar: profile_pic,
      })
    );
  }

  async processSentReciept(messageObj) {
    const { chatId } = messageObj;
    const dbMessageObj = convertWebhookRecieptToJsonObj(messageObj);
    this.conversationRepository.createIfNotExists(dbMessageObj);
    this.emitNewMessageEvent(dbMessageObj, chatId);
    await this.chatRepository.updateLastMessage(
      chatId,
      convertWebhookToDBChatUpdateObject({
        ...messageObj,
        message: dbMessageObj,
      })
    );
  }

  async processIncomingMessage(messageObj) {
    const { chatId } = messageObj;
    const dbMessageObj = convertWebhookReciveMessageToJsonObj(messageObj);
    await this.conversationRepository.createIfNotExists(dbMessageObj);
    this.emitNewMessageEvent(dbMessageObj, chatId);
    await this.chatRepository.updateLastMessage(
      chatId,
      convertWebhookToDBChatUpdateObject({
        ...messageObj,
        message: dbMessageObj,
      })
    );
  }

  async processReaction(messageObj) {

    const { mid } = messageObj;
    const mesasge = await this.conversationRepository.update({
      reaction: messageObj.reaction.emoji,
    }, {
      message_id: mid
    });
    this.emitNewReactionEvent(mesasge, chatId);

  }

  async processDeliveryMessage(messageObj) {
    const { mid } = messageObj;
    return this.conversationRepository.updateConversationStatus(mid, READ);
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

  async emitUpdateConversationEvent(chatId) {
    const chat = await this.chatRepository.findChatByChatId(chatId);
    const chats = await this.chatRepository.findUidId(chat.uid);
    const agentChat = await AgentChatRepository.getAssignedAgent(chatId);

    this.executeSocket(
      "updateConversation",
      {
        chats,
      },
      USER
    );

    if (agentChat) {
      const agentChats = await AgentChatRepository.getAgentChats(agentChat.uid);
      const chatIds = agentChats.map((i) => i?.chat_id);
      const chats = await this.chatRepository.searchByChatIds(chatIds);
      this.executeSocket(
        "updateConversation",
        {
          chats,
        },
        AGENT
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
