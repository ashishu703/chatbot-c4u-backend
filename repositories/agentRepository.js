const { Agent } = require("../models/agents");

class AgentRepository {
  static async findByEmail(email) {
    return await Agent.findOne({ where: { email } });
  }

  static async findById(uid) {
    return await Agent.findByPk(uid);
  }

  static async findByOwner(owner_uid) {
    return await Agent.findAll({ where: { owner_uid } });
  }

  static async create(agent) {
    await Agent.create(agent);
  }

  static async updateActiveness(uid, is_active) {
    await Agent.update({ is_active }, { where: { uid } });
  }

  static async delete(uid, owner_uid) {
    await Agent.destroy({ where: { uid, owner_uid } });
  }
}

module.exports = AgentRepository;