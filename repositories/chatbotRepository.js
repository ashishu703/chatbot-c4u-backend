const { Chatbot } = require("../models");

class ChatbotRepository {
   async create(chatbot) {
    return await Chatbot.create(chatbot);
  }

   async update(id, chatbot, uid) {
    return await Chatbot.update(chatbot, { where: { id, uid } });
  }

   async findByUid(uid) {
    return await Chatbot.findAll({ where: { uid } });
  }

   async updateStatus(id, active, uid) {
    return await Chatbot.update({ active }, { where: { id, uid } });
  }

   async delete(id, uid) {
    return await Chatbot.destroy({ where: { id, uid } });
  }
  async findByStatus(uid, active) {
    return await Chatbot.findAll({ where: { uid, active } });
  }

  async countByUid(uid) {
    return await Chatbot.count({ where: { uid } });
  }

}

module.exports = ChatbotRepository;