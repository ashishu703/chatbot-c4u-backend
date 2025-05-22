const path = require("path");
const AgentChatRepository = require("../repositories/AgentChatRepository");
const ChatRepository = require("../repositories/chatRepository");
const ContactRepository = require("../repositories/contactRepository");
const AgentRepository = require("../repositories/AgentRepository");
const {
  mergeArrays,
  readJSONFile,
  sendMetaMsg,
} = require("../functions/function");
const ChatNotFoundException = require("../exceptions/CustomExceptions/ChatNotFoundException");

class ChatService {
  constructor() {
    this.chatRepository = new ChatRepository();
  }

  async getAgentChatsOwner(owner_uid, agent_uid) {
    const chats = await AgentChatRepository.findChatsByAgent(
      owner_uid,
      agent_uid
    );
    return chats;
  }

  async getAssignedChatAgent(owner_uid, chat_id) {
    const agentChat = await AgentChatRepository.findByChatId(
      owner_uid,
      chat_id
    );
    if (!agentChat) {
      return {};
    }
    const agent = await AgentRepository.findById(agentChat.uid);
    if (!agent) {
      return {};
    }
    return {
      ...agent.dataValues,
      chat_id: agentChat.chat_id,
      owner_uid: agentChat.owner_uid,
    };
  }

  async updateAgentInChat(owner_uid, assignAgent, chat_id) {
    if (assignAgent?.uid) {
      await AgentChatRepository.deleteByChatId(owner_uid, chat_id);
      await AgentChatRepository.create({
        owner_uid,
        uid: assignAgent.uid,
        chat_id,
      });
    } else {
      await AgentChatRepository.deleteByChatId(owner_uid, chat_id);
    }
  }

  async deleteAssignedChat(owner_uid, uid, chat_id) {
    await AgentChatRepository.delete(owner_uid, uid, chat_id);
  }

  async getMyAssignedChats(agent_uid, owner_uid) {
    const agentChats = await AgentChatRepository.findByAgentId(agent_uid);
    if (!agentChats.length) {
      return [];
    }
    const chatIds = agentChats.map((chat) => chat.chat_id);
    const chats = await ChatRepository.findByIds(chatIds, owner_uid);
    const contacts = await ContactRepository.findByOwner(owner_uid);
    return mergeArrays(contacts, chats);
  }

  async getConversation(owner_uid, chatId) {
    const filePath = path.join(
      __dirname,
      `../conversations/inbox/${owner_uid}/${chatId}.json`
    );
    return readJSONFile(filePath, 100);
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
      status: "sent",
      star: false,
      route: "OUTGOING",
      agent: agentEmail,
    };
    return await sendMetaMsg(ownerUid, msgObj, toNumber, savObj, chatId);
  }

  async changeChatTicketStatus(chatId, status) {
    await ChatRepository.updateStatus(chatId, status);
  }
  async saveNote(chatId, note) {
    return this.chatRepository.updateNote(chatId, note);
  }

  async pushTag(chatId, tag) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new ChatNotFoundException();

    const tags = chat.chat_tags ? JSON.parse(chat.chat_tags) : [];
    tags.push(tag);

    return this.chatRepository.updateTags(chatId, JSON.stringify(tags));
  }

  async deleteTag(chatId, tag) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new ChatNotFoundException();

    const tags = chat.chat_tags ? JSON.parse(chat.chat_tags) : [];
    const filteredTags = tags.filter((t) => t !== tag);

    return this.chatRepository.updateTags(chatId, JSON.stringify(filteredTags));
  }
}

module.exports = ChatService;
