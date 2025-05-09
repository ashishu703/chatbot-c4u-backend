const { Chat } = require('../models');
const db = require("../utils/db");

class ChatRepository {
   async findByUid(uid) {
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

   async findByChatStatus(uid, chat_status) {
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

   async updateStatus(chat_id, chat_status) {
    try {
      await Chat.update({ chat_status }, { where: { chat_id } });
    } catch (err) {
      console.error('Error updating chat status:', err);
      throw new Error('Error updating chat status');
    }
  }

   async delete(uid, chat_id) {
    try {
      return await Chat.destroy({ where: { uid, chat_id } });
    } catch (err) {
      console.error('Error deleting chat:', err);
      throw new Error('Error deleting chat');
    }
  }

   async findByChatId(chatId) {
    try {
      return await Chat.findOne({ where: { chat_id: chatId } });
    } catch (err) {
      console.error('Error in findByChatId:', err);
      throw new Error('Error fetching chat by ID');
    }
  }

   async update(chatId, updateData) {
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

   async countByUid(uid) {
    try {
      return await Chat.count({ where: { uid } });
    } catch (err) {
      console.error('Error counting chats by UID:', err);
      throw new Error('Error counting chats by UID');
    }
  }
  async findById(chatId) {
    const [result] = await db.query("SELECT * FROM chats WHERE chat_id = $1", {
      bind: [chatId],
    });
    return result[0] || null;
  }

  async updateNote(chatId, note) {
    return db.query("UPDATE chats SET chat_note = $1 WHERE chat_id = $2", {
      bind: [note, chatId],
    });
  }

  async updateTags(chatId, tags) {
    return db.query("UPDATE chats SET chat_tags = $1 WHERE chat_id = $2", {
      bind: [tags, chatId],
    });
  }

}

module.exports = ChatRepository;