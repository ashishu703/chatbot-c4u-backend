const { Agents } = require("../models");

class AgentRepository {
  async findByEmail(email) {
    return await Agents.findOne({ where: { email } });
  }

  async findById(uid) {
    return await Agents.findByPk(uid);
  }

  async findByOwner(owner_uid) {
    return await Agents.findAll({ where: { owner_uid } });
  }

  async create(agent) {
    await Agents.create(agent);
  }

  async updateActiveness(uid, is_active) {
    await Agents.update({ is_active }, { where: { uid } });
  }

  async delete(uid, owner_uid) {
    await Agents.destroy({ where: { uid, owner_uid } });
  }
}

module.exports = AgentRepository;