const UserService = require('../services/UserService');
const HttpException = require('../middlewares/HttpException');
const TokenMissingOrInvalidExecption = require('../exceptions/CustomExceptions/TokenMissingOrInvalidExecption');
const { formSuccess } = require('../utils/response.utils');
const{ __t }= require("../utils/locale.utils")
class UserController {
  userService;

  constructor() {
    this.userService = new UserService(); 
  }
  async getUsers(req, res, next) {
    try {
      console.log('req.decode:', req.decode);
      const users = await this.userService.getUsers(req.decode.uid);
      return formSuccess({ data: users });
    } catch (err) {
      next(err);
    }
  }

  async updateUser(req, res, next) {
    try {
      await this.userService.updateUser(req.body);
      return formSuccess({ msg: __t("user_was_updated"),

       });
    } catch (err) {
      next(err);
    }
  }

  async autoLogin(req, res, next) {
    try {
      const token = await this.userService.autoLogin(req.body.uid);
      return formSuccess({ token });
    } catch (err) {
      next(err);
    }
  }

  async deleteUser(req, res, next) {
    try {
      await this.userService.deleteUser(req.body.id);
      return formSuccess({ msg: __t("user_was_deleted"),

       });
    } catch (err) {
      next(err);
    }
  }

  async returnMediaUrl(req, res, next) {
    try {
      const files = req.files;
      const result = await this.userService.returnMediaUrl(req.decode.uid, files);
      return formSuccess(result);
    } catch (err) {
     next(err);
    }
  }

  async getMe(req, res, next) {
    try {
      const data = await this.userService.getMe(req.decode.uid);
      return formSuccess(data);
    } catch (err) {
      next(err);
    }
  }

  async saveNote(req, res, next) {
    try {
      const { chatId, note } = req.body;
       await this.userService.saveNote(req.decode.uid, chatId, note);
      return formSuccess({ msg: __t("notes_were_updated"),});
    } catch (err) {
      next(err);
    }
  }

  async pushTag(req, res, next) {
    try {
      const { tag, chatId } = req.body;
       await this.userService.pushTag(req.decode.uid, tag, chatId);
      return formSuccess({msg : __t("tag_was_added"),});
    } catch (err) {
      next(err);
    }
  }

  async deleteTag(req, res, next) {
    try {
      const { tag, chatId } = req.body;
       await this.userService.deleteTag(req.decode.uid, tag, chatId);
      return formSuccess({msg : __t("tag_was_deleted"),});
    } catch (err) {
      next(err);
    }
  }

  async checkContact(req, res, next) {
    try {
      const { mobile } = req.body;
      const result = await this.userService.checkContact(req.decode.uid, mobile);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async saveContact(req, res, next) {
    try {
       await this.userService.saveContact(req.decode.uid, req.body);
      return formSuccess({msg : __t("contact_added"),});
    } catch (err) {
      next(err);
    }
  }

  async deleteContact(req, res, next) {
    try {
       await this.userService.deleteContact(req.body.id);
      return formSuccess({msg : __t("contacts_deleted"),});
    } catch (err) {
      next(err);
    }
  }

  async updateProfile(req, res, next) {
    try {
      await this.userService.updateProfile(req.decode.uid, req.body);
      return formSuccess({msg : __t("profile_updated"),});
    } catch (err) {
      next(err);
    }
  }

  async getDashboard(req, res, next) {
    try {
      const result = await this.userService.getDashboard(req.decode.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async addTaskForAgent(req, res, next) {
    try {
      const { title, des, agent_uid } = req.body;
       await this.userService.addTaskForAgent(req.decode.uid, title, des, agent_uid);
      return formSuccess({msg : __t("task_added"),});
    } catch (err) {
      next(err);
    }
  }

  async getMyAgentTasks(req, res, next) {
    try {
      const result = await this.userService.getMyAgentTasks(req.decode.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
  
  

  async deleteAgentTask(req, res, next) {
    try {
      const { id } = req.body;
       await this.userService.deleteAgentTask(id, req.decode.uid);
      return formSuccess({ msg:__t("task_deleted")});
    } catch (err) {
      next(err);
    }
  }
  

  async updateAgentProfile(req, res, next) {
    try {
       await this.userService.updateAgentProfile(req.body);
      return formSuccess({msg : __t("agent_profile_updated"),});
    } catch (err) {
      next(err);
    }
  }

  async fetchProfile(req, res, next) {
    try {
      const result = await this.userService.fetchProfile(req.decode.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async verify(req, res, next) {
    try {
      let token = req.headers.authorization?.split(' ')[1];
      if (!token) 
        throw new TokenMissingOrInvalidExecption();
      const user = await this.userService.verifyToken(token);
      return formSuccess({ user });
    } catch (err) {
     next(err);
    }
  }

  async loginWithFacebook(req, res, next) {
    try {
      const result = await this.userService.loginWithFacebook(req.body);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async loginWithGoogle(req, res, next) {
    try {
      const result = await this.userService.loginWithGoogle(req.body.token);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async signup(req, res, next) {
    try {
      const result = await this.userService.signup(req.body);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async login(req, res, next) {
    try {
      const result = await this.userService.login(req.body);
      return formSuccess(result);
    } catch (err) {
     next(err);
    }
  }

  async sendRecovery(req, res, next) {
    try {
      const result = await this.userService.sendRecovery(req.body.email);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async modifyPassword(req, res, next) {
    try {
      const result = await this.userService.modifyPassword(req.decode, req.query.pass);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async generateApiKeys(req, res, next) {
    try {
      const result = await this.userService.generateApiKeys(req.decode.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async autoAgentLogin(req, res, next) {
    try {
      const result = await this.userService.autoAgentLogin(req.body.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = UserController; 