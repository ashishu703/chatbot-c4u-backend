const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const AgentRepository = require("../repositories/AgentRepository");
const AgentTaskRepository = require("../repositories/AgentTaskRepository");
const { __t } = require("../utils/locale.utils");
const EmailAlreadyInUseException = require("../exceptions/CustomExceptions/EmailAlreadyInUseException");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const AgentNotFoundException = require("../exceptions/CustomExceptions/AgentNotFoundException");
const { COMPLETED } = require("../types/tasks.types");
const { AGENT } = require("../types/roles.types");
const { tokenExpirationTime, passwordEncryptionRounds, jwtKey } = require("../config/app.config");
const { generateUid, encryptPassword } = require("../utils/auth.utils");
class AgentService {
  constructor() {
    this.agentRepository = new AgentRepository();
    this.agentTaskRepository = new AgentTaskRepository();
  }

  async addAgent({ owner_uid, name, password, email, mobile, comments }) {
    const existingAgent = await this.agentRepository.findByEmail(email);
    if (existingAgent) {
      throw new EmailAlreadyInUseException();
    }
    
    const hashPass = encryptPassword(password);
    const uid = generateUid();
    await this.agentRepository.create({
      owner_uid,
      uid,
      email,
      password: hashPass,
      name,
      mobile,
      comments,
      is_active: 1,
    });
  }

  async getMyAgents(owner_uid) {
    return await this.agentRepository.findByOwner(owner_uid);
  }

  async changeAgentActiveness(agentUid, activeness) {
    await this.agentRepository.updateActiveness(agentUid, activeness ? 1 : 0);
  }

  async deleteAgent(uid, owner_uid) {
    await this.agentRepository.delete(uid, owner_uid);
  }

  async login(email, password) {
    const agent = await this.agentRepository.findByEmail(email);
    if (!agent) {
      throw new InvalidCredentialsException();
    }
    const compare = await bcrypt.compare(password, agent.password);
    if (!compare) {
      throw new InvalidCredentialsException();
    }
    return sign(
      {
        uid: agent.uid,
        role: AGENT,
        email: agent.email,
      },
      jwtKey,
      { expiresIn: tokenExpirationTime }
    );
  }

  async getAgentById(uid) {
    const agent = await this.agentRepository.findById(uid);
    if (!agent) {
      throw new AgentNotFoundException();
    }
    return agent;
  }

  async getAgentTasks(uid) {
    return await this.agentTaskRepository.findByAgentId(uid);
  }

  async markTaskComplete(id, comment) {
    await this.agentTaskRepository.updateTask(id, COMPLETED, comment);
  }
}

module.exports = AgentService;
