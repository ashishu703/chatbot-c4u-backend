const bcrypt = require("bcrypt");
const randomstring = require("randomstring");
const { sign } = require("jsonwebtoken");
const AgentRepository = require("../repositories/agentRepository");
const AgentTaskRepository = require("../repositories/AgentTaskRepository");

class AgentService {
  constructor() {
    this.agentRepository = new AgentRepository();
    this.agentTaskRepository = new AgentTaskRepository();
  }

  async addAgent({ owner_uid, name, password, email, mobile, comments }) {
    const existingAgent = await this.agentRepository.findByEmail(email);
    if (existingAgent) {
      throw new Error(
        "This email is already used by you or someone else on the platform, Please choose another email"
      );
    }
    const hashPass = await bcrypt.hash(password, 10);
    const uid = randomstring.generate();
    await this.agentRepository.create({
      owner_uid,
      uid,
      email,
      password: hashPass,
      name,
      mobile,
      comments,
      is_active: 1, // Set as integer to match model
    });
  }

  async getMyAgents(owner_uid) {
    return await this.agentRepository.findByOwner(owner_uid);
  }

  async changeAgentActiveness(agentUid, activeness) {
    await this.agentRepository.updateActiveness(agentUid, activeness ? 1 : 0); // Convert boolean to integer
  }

  async deleteAgent(uid, owner_uid) {
    await this.agentRepository.delete(uid, owner_uid);
  }

  async login(email, password) {
    const agent = await this.agentRepository.findByEmail(email);
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
        email: agent.email,
      },
      process.env.JWTKEY,
      { expiresIn: "7d" } // Token expires in 7 days
    );
  }

  async getAgentById(uid) {
    const agent = await this.agentRepository.findById(uid);
    if (!agent) {
      throw new Error("Agent not found");
    }
    return agent;
  }

  async getAgentTasks(uid) {
    return await this.agentTaskRepository.findByAgentId(uid);
  }

  async markTaskComplete(id, comment) {
    await this.agentTaskRepository.updateTask(id, "COMPLETED", comment);
  }
}

module.exports = AgentService;