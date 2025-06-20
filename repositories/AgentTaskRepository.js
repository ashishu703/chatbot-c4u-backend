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

async updateTaskStatus(id, comment) {
    const updateData = {
      status: "COMPLETED",
      agent_comments: comment,
    };
    const [rowsUpdated] = await this.model.update(updateData, {
      where: { id },
    });

    if (rowsUpdated === 0) {
    }
    return await this.model.findOne({ where: { id } });
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
