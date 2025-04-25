const path = require("path");
const AgentChatRepository = require("../repositories/AgentChatRepository");
const ChatRepository = require("../repositories/chatRepository");
const ContactRepository = require("../repositories/contactRepository");
const AgentRepository = require("../repositories/agentRepository");
const { mergeArrays, readJSONFile, sendMetaMsg } = require("../functions/function");

class ChatService {
  static async getAgentChatsOwner(owner_uid, agent_uid) {
    const chats = await AgentChatRepository.findChatsByAgent(owner_uid, agent_uid);
    return chats;
  }

  static async getAssignedChatAgent(owner_uid, chat_id) {
    const agentChat = await AgentChatRepository.findByChatId(owner_uid, chat_id);
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

  static async updateAgentInChat(owner_uid, assignAgent, chat_id) {
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

  static async deleteAssignedChat(owner_uid, uid, chat_id) {
    await AgentChatRepository.delete(owner_uid, uid, chat_id);
  }

  static async getMyAssignedChats(agent_uid, owner_uid) {
    const agentChats = await AgentChatRepository.findByAgentId(agent_uid);
    if (!agentChats.length) {
      return [];
    }
    const chatIds = agentChats.map((chat) => chat.chat_id);
    const chats = await ChatRepository.findByIds(chatIds, owner_uid);
    const contacts = await ContactRepository.findByOwner(owner_uid);
    return mergeArrays(contacts, chats);
  }

  static async getConversation(owner_uid, chatId) {
    const filePath = path.join(__dirname, `../conversations/inbox/${owner_uid}/${chatId}.json`);
    return readJSONFile(filePath, 100);
  }

  static async sendMessage({ ownerUid, type, content, toNumber, toName, chatId, agentEmail }) {
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

  static async changeChatTicketStatus(chatId, status) {
    await ChatRepository.updateStatus(chatId, status);
  }
}

module.exports = ChatService;