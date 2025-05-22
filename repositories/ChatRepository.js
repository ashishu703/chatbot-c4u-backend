const { Chat } = require("../models");
const Repository = require("./Repository");

class ChatRepository extends Repository {
  constructor() {
    super(Chat);
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


}

module.exports = ChatRepository;
