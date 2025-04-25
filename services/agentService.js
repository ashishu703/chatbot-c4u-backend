const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const { sign } = require("jsonwebtoken");
const AgentRepository = require("../repositories/agentRepository");
const AgentTaskRepository = require("../repositories/agentTaskRepository");

class AgentService {
  static async addAgent({ owner_uid, name, password, email, mobile, comments }) {
    const existingAgent = await AgentRepository.findByEmail(email);
    if (existingAgent) {
      throw new Error(
        "This email is already used by you or someone else on the platform, Please choose another email"
      );
    }
    const hashPass = await bcrypt.hash(password, 10);
    const uid = randomstring.generate();
    await AgentRepository.create({
      owner_uid,
      uid,
      email,
      password: hashPass,
      name,
      mobile,
      comments,
    });
  }

  static async getMyAgents(owner_uid) {
    return await AgentRepository.findByOwner(owner_uid);
  }

  static async changeAgentActiveness(agentUid, activeness) {
    await AgentRepository.updateActiveness(agentUid, !!activeness);
  }

  static async deleteAgent(uid, owner_uid) {
    await AgentRepository.delete(uid, owner_uid);
  }

  static async login(email, password) {
    const agent = await AgentRepository.findByEmail(email);
    if (!agent) {
      throw new Error("Invalid credentials");
    }
    const compare = await bcrypt.compare(password, agent.password);
    if (!compare) {
      throw new Error("Invalid credentials");
    }
    return sign(
      {
        uid: agent.uid,
        role: "agent",
        password: agent.password,
        email: agent.email,
      },
      process.env.JWTKEY,
      {}
    );
  }

  static async getAgentById(uid) {
    const agent = await AgentRepository.findById(uid);
    if (!agent) {
      throw new Error("Agent not found");
    }
    return agent;
  }

  static async getAgentTasks(uid) {
    return await AgentTaskRepository.findByAgentId(uid);
  }

  static async markTaskComplete(id, comment) {
    await AgentTaskRepository.updateTask(id, "COMPLETED", comment);
  }
}

module.exports = AgentService;