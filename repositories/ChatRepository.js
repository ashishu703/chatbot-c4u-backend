const { Chat } = require('../models');

class ChatRepository {
  static async findByUid(uid) {
    try {
      if (!uid) {
        throw new Error('Invalid parameter: uid is missing');
      }
      return await Chat.findAll({ where: { uid } });
    } catch (err) {
      console.error('Error fetching chats by UID:', err);
      throw new Error('Error fetching chats by UID');
    }
  }

  static async findByChatStatus(uid, chat_status) {
    try {
      if (!uid || !chat_status) {
        throw new Error('Invalid parameters: uid or chat_status is missing');
      }
      return await Chat.findAll({
        where: {
          uid,
          chat_status,
        },
      });
    } catch (err) {
      console.error('Error fetching chats by status:', err);
      throw new Error('Error fetching chats by status');
    }
  }

  static async updateStatus(chat_id, chat_status) {
    try {
      await Chat.update({ chat_status }, { where: { chat_id } });
    } catch (err) {
      console.error('Error updating chat status:', err);
      throw new Error('Error updating chat status');
    }
  }

  static async delete(uid, chat_id) {
    try {
      return await Chat.destroy({ where: { uid, chat_id } });
    } catch (err) {
      console.error('Error deleting chat:', err);
      throw new Error('Error deleting chat');
    }
  }

  static async findByChatId(chatId) {
    try {
      return await Chat.findOne({ where: { chat_id: chatId } });
    } catch (err) {
      console.error('Error in findByChatId:', err);
      throw new Error('Error fetching chat by ID');
    }
  }

  static async update(chatId, updateData) {
    try {
      const chat = await Chat.findOne({ where: { chat_id: chatId } });
      if (chat) {
        return await chat.update(updateData);
      }
      return null;
    } catch (err) {
      console.error('Error updating chat:', err);
      throw new Error('Error updating chat');
    }
  }

  static async countByUid(uid) {
    try {
      return await Chat.count({ where: { uid } });
    } catch (err) {
      console.error('Error counting chats by UID:', err);
      throw new Error('Error counting chats by UID');
    }
  }
}

module.exports = ChatRepository;