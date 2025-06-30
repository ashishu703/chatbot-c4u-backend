const { Op } = require("sequelize");
const { Chat, ChatbotChat, Chatbot, Flow, FlowNode, FlowEdge, FacebookPage, SocialAccount } = require("../models");
const Repository = require("./Repository");
const { ACTIVE } = require('../types/chatbot-status.types');


class ChatRepository extends Repository {
  constructor() {
    super(Chat);
  }

  async findChatsByAgent(uid, owner_uid) {
    return this.find({
      where: {
        owner_uid,
        uid,
      },
    });
  }


  async findByChatStatus(uid, chat_status) {
    return this.find({
      where: {
        uid,
        chat_status,
      },
    });
  }

  async updateStatus(chat_id, chat_status) {
    return this.update({ chat_status }, { chat_id });
  }

  async countByUid(uid) {
    return this.count({ where: { uid } });
  }

  async findByOwnerAndIds(owner_id, ids) {
    return this.find(
      Op.and(
        { owner_id },
        { id: { [Op.in]: ids } }
      )
    );
  }


  async updateLastMessage(id, lastMessageId) {
    return this.update({
      last_message_id: lastMessageId,
    }, { id });
  }


  async findInboxChats(uid, query = {}) {
    return this.model.findAll(
      {
        where: { uid },
        include: ["lastMessage", "page", "account"],
        order: [["createdAt", "DESC"]],
      });
  }

  async paginateInboxChats(uid, query = {}) {
    return this.paginate({
      where: { uid },
      include: ["lastMessage", "page", "account"],
      order: [["createdAt", "DESC"]],
      ...query
    });
  }

  async updateNote(chat_id, note) {
    return this.update({ chat_note: note }, { chat_id });
  }
  async updateTags(chat_id, tags) {

    return this.update({ chat_tags: tags }, { chat_id });
  }

  async findWithChatbotDependencies(chatId) {
    return this.findFirst({ where: { id: chatId } }, [
      { model: FacebookPage, as: "page" },
      { model: SocialAccount, as: "account", required: true },
      {
        model: ChatbotChat,
        as: "chatbotChats",
        include: [{
          model: Chatbot,
          as: "chatbot",
          where: { active: ACTIVE },
          required: true,
          include: [{
            model: Flow,
            as: "flow",
            include: [
              {
                model: FlowNode,
                as: "nodes",
                required: true,
              },
              {
                model: FlowEdge,
                as: "edges",
                required: true,
              },
            ]
          }],
        }],
      },
    ]);
  }

  async findWithAccountAndDisablity(id) {
    return this.findFirst({
      where: { id }
    }, ['account', 'disablity']);
  }
}

module.exports = ChatRepository;
