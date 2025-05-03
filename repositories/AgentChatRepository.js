const { AgentChat, Chat, User } = require("../models");

class AgentChatRepository {
  static async findChatsByAgent(owner_uid, uid) {
    return await AgentChat.findAll({
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

  static async findByChatId(owner_uid, chat_id) {
    return await AgentChat.findOne({ where: { owner_uid, chat_id } });
  }

  static async create(agentChat) {
    await AgentChat.create(agentChat);
  }

  static async deleteByChatId(owner_uid, chat_id) {
    await AgentChat.destroy({ where: { owner_uid, chat_id } });
  }

  static async delete(owner_uid, uid, chat_id) {
    await AgentChat.destroy({ where: { owner_uid, uid, chat_id } });
  }

  static async findByAgentId(uid) {
    return await AgentChat.findAll({ where: { uid } });
  }
}

module.exports = AgentChatRepository;