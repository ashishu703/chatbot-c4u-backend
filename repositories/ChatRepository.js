const { Op } = require("sequelize");
const { Chat } = require("../models");
const Repository = require("./Repository");

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
    return this.update({ last_message_id: lastMessageId }, { id });
  }
}

module.exports = ChatRepository;
