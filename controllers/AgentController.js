const AgentService = require("../services/agentService");
const { isValidEmail } = require("../functions/function");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const {formSuccess} = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
class AgentController {
  constructor() {
    this.agentService = new AgentService();
  }

  async addAgent(req, res, next) {
    try {
      const { name, password, email, mobile, comments } = req.body;

      if (!name || !password || !email || !mobile) {
        throw new FillAllFieldsException();
      }

      if (!isValidEmail(email)) {
        throw new InvalidCredentialsException();
      }

      await this.agentService.addAgent({
        owner_uid: req.decode.uid,
        name,
        password,
        email: email.toLowerCase(),
        mobile,
        comments,
      });

      return formSuccess({msg: __t("agent_account_created"),

      });
    } catch (err) {
     next(err);
    }
  }

  async getMyAgents(req, res, next) {
    try {
      const agents = await this.agentService.getMyAgents(req.decode.uid);
      return formSuccess({data: agents});
    } catch (err) {
      next(err);
    }
  }

  async changeAgentActiveness(req, res, next) {
    try {
      const { agentUid, activeness } = req.body;
      await this.agentService.changeAgentActiveness(agentUid, activeness);
      return formSuccess({msg: __t(success),

       });
    } catch (err) {
     next(err);
    }
  }

  async deleteAgent(req, res, next) {
    try {
      const { uid } = req.body;
      await this.agentService.deleteAgent(uid, req.decode.uid);
      return formSuccess({msg:__t(agent_was_deleted),
        
       });
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        throw new FillAllFieldsException();
      }

      const token = await this.agentService.login(email, password);
      return formSuccess({token });
    } catch (err) {
      next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const agent = await this.agentService.getAgentById(req.decode.uid);
      return formSuccess({data: agent});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AgentController;