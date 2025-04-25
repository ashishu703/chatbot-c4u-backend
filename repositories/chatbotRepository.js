const { Chatbot } = require("../models/chatbot");

class ChatbotRepository {
  static async create(chatbot) {
    return await Chatbot.create(chatbot);
  }

  static async update(id, chatbot, uid) {
    return await Chatbot.update(chatbot, { where: { id, uid } });
  }

  static async findByUid(uid) {
    return await Chatbot.findAll({ where: { uid } });
  }

  static async updateStatus(id, active, uid) {
    return await Chatbot.update({ active }, { where: { id, uid } });
  }

  static async delete(id, uid) {
    return await Chatbot.destroy({ where: { id, uid } });
  }
 static async findByStatus(uid, active) {
    return await Chatbot.findAll({ where: { uid, active } });
  }

 static async countByUid(uid) {
    return await Chatbot.count({ where: { uid } });
  }

}

module.exports = ChatbotRepository;