const { Chat } = require("../models/chats");

class ChatRepository {
  static async findByIds(chatIds, uid) {
    return await Chat.findAll({
      where: { chat_id: chatIds, uid },
    });
  }

  static async updateStatus(chat_id, chat_status) {
    await Chat.update({ chat_status }, { where: { chat_id } });
  }

  static async delete(uid, chat_id) {
    return await Chats.destroy({ where: { uid, chat_id } });
  }

 static async findByChatId(chatId) {
    return await Chats.findOne({ where: { chat_id: chatId } });
  }

 static async update(chatId, updateData) {
    const chat = await Chats.findOne({ where: { chat_id: chatId } });
    if (chat) {
      return await chat.update(updateData);
    }
    return null;
  }

 static async findByStatus(uid, status) {
    return await Chats.findAll({ where: { uid, chat_status: status } });
  }

 static async countByUid(uid) {
    return await Chats.count({ where: { uid } });
  }

}

module.exports = ChatRepository;