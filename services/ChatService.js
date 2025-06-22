const AgentChatRepository = require("../repositories/AgentChatRepository");
const ChatRepository = require("../repositories/ChatRepository");
const ContactRepository = require("../repositories/ContactRepository");
const AgentRepository = require("../repositories/AgentRepository");

const ChatNotFoundException = require("../exceptions/CustomExceptions/ChatNotFoundException");
const { mergeArrays } = require("../utils/others.utils");
const { OUTGOING } = require("../types/conversation-route.types");
const { SENT } = require("../types/conversation-status.types");
const { where } = require("sequelize");

class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
    this.contactRepository = new ContactRepository();
    this.agentRepository = new AgentRepository();
    this.agentChatRepository = new AgentChatRepository();
  }

  async getMyAssignedChats(agent_uid, owner_uid) {
    const agentChats = await this.agentChatRepository.find({
  where: { uid: agent_uid }
});
    if (!agentChats.length) {
      return [];
    }
    const chatIds = agentChats.map((chat) => chat.chat_id);
    const chats = await this.chatRepository.findByOwnerAndIds(owner_uid, chatIds);
    const contacts = await this.contactRepository.findByOwner(owner_uid);
    return mergeArrays(contacts, chats);
  }

  async getConversation(owner_uid, chatId) {
    return this.chatRepository.findFirst({
      owner_uid, chat_id: chatId
    }, ["conversations"]);
  }

  async sendMessage({
    ownerUid,
    type,
    content,
    toNumber,
    toName,
    chatId,
    agentEmail,
  }) {
    const msgObj = { type, [type]: content };
    const savObj = {
      type,
      metaChatId: "",
      msgContext: msgObj,
      reaction: "",
      timestamp: "",
      senderName: toName,
      senderMobile: toNumber,
      status: SENT,
      star: false,
      route: OUTGOING,
      agent: agentEmail,
    };
    return await sendMetaMsg(ownerUid, msgObj, toNumber, savObj, chatId);
  }

  async changeChatTicketStatus(chatId, status) {
    await this.chatRepository.updateStatus(chatId, status);
  }

}

module.exports = ChatService;
