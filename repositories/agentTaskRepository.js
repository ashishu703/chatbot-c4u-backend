const { AgentTask } = require("../models/agent_task");

class AgentTaskRepository {
  static async findByAgentId(uid) {
    return await AgentTask.findAll({ where: { uid } });
  }

  static async updateTask(id, status, agent_comments) {
    await AgentTask.update({ status, agent_comments }, { where: { id } });
  }

 static async create(taskData) {
    return await AgentTask.create(taskData);
  }

 static async findByOwnerUid(owner_uid) {
    return await AgentTask.findAll({
      where: { owner_uid },
      include: [{ model: Agents, attributes: ['email'] }]
    });
  }

 static async delete(id, owner_uid) {
    return await AgentTask.destroy({ where: { id, owner_uid } });
  }

 static async updateAgent(uid, updateData) {
    const agent = await Agents.findOne({ where: { uid } });
    if (agent) {
      return await agent.update(updateData);
    }
    return null;
  }
}

module.exports = AgentTaskRepository;