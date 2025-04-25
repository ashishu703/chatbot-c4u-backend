const UserService = require('../services/userService');
const HttpException = require('../middlewares/HttpException');

class UserController {
  async updateUser(req, res) {
    try {
      await UserService.updateUser(req.body);
      res.json({ success: true, msg: 'User was updated' });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }

  async autoLogin(req, res) {
    try {
      const token = await UserService.autoLogin(req.body.uid);
      res.json({ success: true, token });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  }

  async deleteUser(req, res) {
    try {
      await UserService.deleteUser(req.body.id);
      res.json({ success: true, msg: 'User was deleted' });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  }

  async returnMediaUrl(req, res) {
    try {
      const files = req.files;
      const result = await UserService.returnMediaUrl(req.decode.uid, files);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ success: false, msg: error.message || 'Something went wrong' });
    }
  }

  async getMe(req, res) {
    try {
      const data = await UserService.getMe(req.decode.uid);
      res.json(data);
    } catch (error) {
      res.status(error.status || 500).json({ success: false, msg: error.message });
    }
  }

  async saveNote(req, res) {
    try {
      const { chatId, note } = req.body;
      const result = await UserService.saveNote(req.decode.uid, chatId, note);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async pushTag(req, res) {
    try {
      const { tag, chatId } = req.body;
      const result = await UserService.pushTag(req.decode.uid, tag, chatId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async deleteTag(req, res) {
    try {
      const { tag, chatId } = req.body;
      const result = await UserService.deleteTag(req.decode.uid, tag, chatId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async checkContact(req, res) {
    try {
      const { mobile } = req.body;
      const result = await UserService.checkContact(req.decode.uid, mobile);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async saveContact(req, res) {
    try {
      const result = await UserService.saveContact(req.decode.uid, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async deleteContact(req, res) {
    try {
      const result = await UserService.deleteContact(req.body.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const result = await UserService.updateProfile(req.decode.uid, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async getDashboard(req, res) {
    try {
      const result = await UserService.getDashboard(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async addTaskForAgent(req, res) {
    try {
      const { title, des, agent_uid } = req.body;
      const result = await UserService.addTaskForAgent(req.decode.uid, title, des, agent_uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async getMyAgentTasks(req, res) {
    try {
      const result = await UserService.getMyAgentTasks(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async deleteTaskForAgent(req, res) {
    try {
      const result = await UserService.deleteTaskForAgent(req.decode.uid, req.body.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async updateAgentProfile(req, res) {
    try {
      const result = await UserService.updateAgentProfile(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async fetchProfile(req, res) {
    try {
      const result = await UserService.fetchProfile(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async verify(req, res) {
    try {
      let token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new HttpException('Invalid token provided', 400);
      const user = await UserService.verifyToken(token);
      res.status(200).json({ user });
    } catch (error) {
      res.status(400).json({ message: 'Token expired' });
    }
  }

  async loginWithFacebook(req, res) {
    try {
      const result = await UserService.loginWithFacebook(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async loginWithGoogle(req, res) {
    try {
      const result = await UserService.loginWithGoogle(req.body.token);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async signup(req, res) {
    try {
      const result = await UserService.signup(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async login(req, res) {
    try {
      const result = await UserService.login(req.body);
      res.status(200).json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message || 'Something went wrong' });
    }
  }

  async sendRecovery(req, res) {
    try {
      const result = await UserService.sendRecovery(req.body.email);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async modifyPassword(req, res) {
    try {
      const result = await UserService.modifyPassword(req.decode, req.query.pass);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async generateApiKeys(req, res) {
    try {
      const result = await UserService.generateApiKeys(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async autoAgentLogin(req, res) {
    try {
      const result = await UserService.autoAgentLogin(req.body.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async getUsers(req, res) {
    try {
      const users = await UserService.getUsers(req.decode.uid);
      res.json({ success: true, data: users });
    } catch (error) {
      res.status(error.status || 500).json({ success: false, msg: error.message });
    }
  }
}

module.exports = new UserController();
