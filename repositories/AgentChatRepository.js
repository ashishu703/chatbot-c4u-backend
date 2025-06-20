const { AgentChat, Chat, User } = require("../models");
const Repository = require("./Repository");

class AgentChatRepository extends Repository {


  constructor() {
    super(AgentChat);
  }

  async findChatsByAgent(owner_uid, uid) {
    return this.find({
      where: { owner_uid, uid },
      include: [
        {
          model: Chat,
          where: { uid: owner_uid },
          include: [{ model: User }],
        },
      ],
    });
  }

  async findByChatId(owner_uid, chat_id) {
    return this.findFirst({ where: { owner_uid, chat_id } });
  }

  async deleteByChatId(owner_uid, chat_id) {
    return this.delete({ owner_uid, chat_id });
  }

  async deleteByOwner(owner_uid, uid, chat_id) {
    return this.delete({ owner_uid, uid, chat_id });
  }

  async findByAgentId(uid) {
    return this.find({ where: { uid } }, ["chat"]);
  }
}

module.exports = AgentChatRepository;
