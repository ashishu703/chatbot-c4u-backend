const { Agent } = require("../models");
const Repository = require("./Repository");

class AgentRepository extends Repository {

  constructor() {
    super(Agent);
  }

  async findByEmail(email) {
    return this.findFirst({ where: { email } });
  }

  async findByOwner(owner_uid) {
    return this.find({ where: { owner_uid } });
  }


  async updateActiveness(uid, is_active) {
    return this.update({ is_active }, { uid });
  }

  async delete(uid, owner_uid) {
    return await Agent.destroy({
      where: {
        uid,
        owner_uid
      }
    });
  }

  async markTaskComplete(uid, agentComments = "done") {
    const updateData = {
      status: "COMPLETED",
      agent_comments: agentComments,
    };

    const [rowsUpdated] = await this.model.update(updateData, {
      where: { uid },
    });

    if (rowsUpdated === 0) {
      throw new Error("No task found or already completed.");
    }

    return await this.model.findOne({ where: { uid } });
  }

}

module.exports = AgentRepository;
