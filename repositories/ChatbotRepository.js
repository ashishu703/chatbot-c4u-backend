const { Chatbot, ChatbotChat } = require("../models");
const ChatbotChatRepository = require("./ChatbotChatRepository");
const Repository = require("./Repository");

class ChatbotRepository extends Repository {
  constructor() {
    super(Chatbot);
    this.chatbotChatRepository = new ChatbotChatRepository();
  }

  async updateStatus(id, active, uid) {
    return this.update({ active }, { id, uid });
  }

  async findByStatus(uid, active) {
    return this.find({ where: { uid, active } });
  }

  async countByUid(uid) {
    return this.count({ where: { uid } });
  }

  async deletechatbot(id) {
    if (!id || typeof id !== 'number') {
    }

    const records = await this.model.findAll({ where: { id } });
    await this.model.destroy({ where: { id } });

    return records.map(record => record.toJSON());
  }


  async createAndAttachChats({
    title,
    flow_id,
    for_all,
    uid
  }, chatIds = []) {
    return this.model.create(
      {
        title,
        flow_id,
        for_all,
        uid,
        chatbotChats: chatIds.map(chatId => ({ chat_id: chatId }))
      }, {
      include: ["chatbotChats"]
    });
  }


  async updateAndAttachChats(chatbotId, {
    title,
    flow_id,
    for_all,
    uid
  }, chatIds = []) {
    await this.model.update(
      { title, flow_id, for_all },
      { where: { id: chatbotId, uid } }
    );

    const existingChatbotChats = await this.chatbotChatRepository.find({
      where: { chatbot_id: chatbotId }
    });

    const existingIds = existingChatbotChats.map(c => c.chat_id);
    const incomingIds = chatIds;

    const toDelete = existingIds.filter(id => !incomingIds.includes(id));
    const toCreate = incomingIds.filter(id => !existingIds.includes(id));

    if (toDelete.length) {
      await this.model.destroy({
        where: {
          chatbot_id: chatbotId,
          chat_id: toDelete
        }
      });
    }

    const chatbotChats = toCreate.map(chatId => ({
      chatbot_id: chatbotId,
      chat_id: chatId
    }));

    if (chatbotChats.length) {
      await this.chatbotChatRepository.bulkCreate(chatbotChats);
    }

    const chatbot = await this.model.findByPk(chatbotId);
    return chatbot;
  }


  async getAssignedBots(uid, chatId) {
    return this.model.findAll({
      where: { uid },
      include: [
        {
          model: ChatbotChat,
          as: "chatbotChats",
          where: { chat_id: chatId },
          required: true,
        }
      ]
    });
  }

  async getGeneralBots(uid) {
    return this.model.findAll({
      where: { uid },
      where: { for_all: true },
    });
  }


}

module.exports = ChatbotRepository;
