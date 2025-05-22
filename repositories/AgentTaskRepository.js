const { AgentTask, Agents } = require("../models");
const Repository = require("./Repository");

class AgentTaskRepository extends Repository {

  constructor() {
    super(AgentTask);
  }

  async findAll(options) {
    return this.find(options);
  }

  async findByAgentId(uid) {
    return this.find({ where: { uid } });
  }

  async updateTask(id, status, agent_comments) {
    return this.update({ status, agent_comments }, { where: { id } });
  }

  async findByOwnerUid(owner_uid) {
    return this.findAll({
      where: { owner_uid },
      include: [
        {
          model: Agents,
          as: "agent",
          attributes: ["email"],
        },
      ],
    });
  }

  async deleteByIdAndOwner(id, owner_uid) {
    return this.delete({
        id,
        owner_uid,
      });
  }
}

module.exports = AgentTaskRepository;
