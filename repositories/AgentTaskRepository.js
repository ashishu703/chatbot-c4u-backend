const { AgentTask, Agents } = require("../models");

class AgentTaskRepository {

   async findAll(options) {
    return await AgentTask.findAll(options);
  }
  

   async findByAgentId(uid) {
    return await AgentTask.findAll({ where: { uid } });
  }

   async updateTask(id, status, agent_comments) {
    await AgentTask.update({ status, agent_comments }, { where: { id } });
  }

   async create(taskData) {
    return await AgentTask.create(taskData);
  }

   async findByOwnerUid(owner_uid) {
    return await AgentTask.findAll({
      where: { owner_uid },
      include: [
        {
          model: Agents,
          as: 'agent',
          attributes: ['email'],
        },
      ],
    });
  }

   async delete(id, owner_uid) {
    return await AgentTask.destroy({ where: { id, owner_uid } });
  }

   async updateAgent(uid, updateData) {
    const agent = await Agents.findOne({ where: { uid } });
    if (agent) {
      return await agent.update(updateData);
    }
    return null;
  }

   async deleteByIdAndOwner(id, owner_uid) {
    const result = await AgentTask.destroy({
      where: {
        id,
        owner_uid,
      },
    });
    return result > 0;
  }
  
}

module.exports = AgentTaskRepository;
