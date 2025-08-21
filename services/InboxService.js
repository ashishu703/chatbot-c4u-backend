const MetaApiRepository = require("../repositories/MetaApiRepository");
const UserRepository = require("../repositories/UserRepository");
const ChatRepository = require("../repositories/ChatRepository");
const ContactRepository = require("../repositories/ContactRepository");
const RoomsRepository = require("../repositories/RoomRepository");
const MessageRepository = require("../repositories/MessageRepository");
const ChatNotFoundException = require("../exceptions/CustomExceptions/ChatNotFoundException");
const AgentChatRepository = require("../repositories/AgentChatRepository");
const { mergeArrays } = require("../utils/others.utils");
const { SocialAccount } = require("../models");
const { WHATSAPP } = require("../types/social-platform-types");
class InboxService {

  constructor() {
    this.metaApiRepository = new MetaApiRepository();
    this.userRepository = new UserRepository();
    this.chatRepository = new ChatRepository();
    this.contactRepository = new ContactRepository();
    this.roomsRepository = new RoomsRepository();
    this.messageRepository = new MessageRepository();
    this.agentChatRepository = new AgentChatRepository();
  }


  async getChats(uid, query = {}) {
    return this.chatRepository.paginateInboxChats(uid, query);
  }
  async getWhatsappChats(uid, query = {}) {
    return this.chatRepository.paginateInboxChats(uid, {
      ...{
        include: [
          { model: SocialAccount, as: "account", required: true, where: { platform: WHATSAPP } }
        ]
      }, ...query
    });
  }

  async getConversation(uid, chatId, query = {}) {
    let resolvedChatId = chatId;
    if (typeof resolvedChatId === "string") {
      const numeric = parseInt(resolvedChatId, 10);
      if (!Number.isFinite(numeric)) {
        const chat = await this.chatRepository.findFirst({ where: { uid, chat_id: resolvedChatId } });
        if (!chat) throw new ChatNotFoundException();
        resolvedChatId = chat.id;
      } else {
        resolvedChatId = numeric;
      }
    }
    return this.messageRepository.paginateInboxMessages(uid, resolvedChatId, query);
  }

  async deleteChat(uid, chatId) {
    return this.chatRepository.delete({ uid, id: chatId });
  }

  async saveNote(chatId, note) {
    return this.chatRepository.updateNote(chatId, note);
  }

  async pushTag(chatId, tag) {
    const chat = await this.chatRepository.findByChatId(chatId);
    if (!chat) throw new ChatNotFoundException();

    const tags = chat.chat_tags;
    tags.push(tag);

    return this.chatRepository.updateTags(chatId, tags);
  }

  async deleteTag(chatId, tag) {
    const chat = await this.chatRepository.findById(chatId);
    if (!chat) throw new ChatNotFoundException();

    const tags = chat.chat_tags;
    const filteredTags = tags.filter((t) => t !== tag);

    return this.chatRepository.updateTags(chatId, filteredTags);
  }


  async getAgentChatsOwner(owner_uid, agent_uid) {
    return this.chatRepository.findChatsByAgent(
      owner_uid,
      agent_uid
    );
  }

  async getAssignedChatAgent(owner_uid, chat_id) {
    const agentChat = await this.agentChatRepository.findFirst(
      {
        where: {
          owner_uid,
          chat_id
        }
      },
      ["agent"]
    );

    if (!agentChat) return null

    return {
      ...agentChat.agent,
      chat_id: agentChat.chat_id,
      owner_uid: agentChat.owner_uid,
    };
  }

  async deleteAssignedChat(owner_uid, uid, chat_id) {
    await this.agentChatRepository.delete({ owner_uid, uid, chat_id });
  }

  async updateAgentInChat(owner_uid, agentUid, chat_id) {
    if (agentUid) {
      await this.agentChatRepository.deleteByChatId(owner_uid, chat_id);
      await this.agentChatRepository.create({
        owner_uid: owner_uid,
        uid: agentUid,
        chat_id,
      });
    } else {
      await this.agentChatRepository.deleteByChatId(owner_uid, chat_id);
    }
  }


  async getAgentAssignedChats(agentId, ownerId) {

    const agentChats = await this.agentChatRepository.findWithInboxChats(agentId);

    const chats = agentChats
      .map(agentChat => agentChat.chat)
      .filter(Boolean);

    const contacts = await this.contactRepository.findByUid(ownerId);

    return mergeArrays(contacts, chats);
  }





  async changeChatTicketStatus(chatId, status) {
    await this.chatRepository.updateStatus(chatId, status);
  }

}



module.exports = InboxService;
