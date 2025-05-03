const AgentService = require("../services/agentService");
const { isValidEmail } = require("../functions/function");

class AgentController {
  constructor() {
    this.agentService = new AgentService();
  }

  async addAgent(req, res) {
    try {
      const { name, password, email, mobile, comments } = req.body;

      if (!name || !password || !email || !mobile) {
        return res.json({ msg: "Please fill all the details" });
      }

      if (!isValidEmail(email)) {
        return res.json({ msg: "Please enter a valid email" });
      }

      await this.agentService.addAgent({
        owner_uid: req.decode.uid,
        name,
        password,
        email: email.toLowerCase(),
        mobile,
        comments,
      });

      res.json({ msg: "Agent account was created", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  async getMyAgents(req, res) {
    try {
      const agents = await this.agentService.getMyAgents(req.decode.uid);
      res.json({ data: agents, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  async changeAgentActiveness(req, res) {
    try {
      const { agentUid, activeness } = req.body;
      await this.agentService.changeAgentActiveness(agentUid, activeness);
      res.json({ success: true, msg: "Success" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  async deleteAgent(req, res) {
    try {
      const { uid } = req.body;
      await this.agentService.deleteAgent(uid, req.decode.uid);
      res.json({ success: true, msg: "Agent was deleted" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.json({
          success: false,
          msg: "Please provide email and password",
        });
      }

      const token = await this.agentService.login(email, password);
      res.json({ success: true, token });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  async getMe(req, res) {
    try {
      const agent = await this.agentService.getAgentById(req.decode.uid);
      res.json({ data: agent, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = AgentController;