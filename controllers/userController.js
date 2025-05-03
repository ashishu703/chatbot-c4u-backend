const UserService = require('../services/userService');
const HttpException = require('../middlewares/HttpException');

class UserController {
  userService;

  constructor() {
    this.userService = new UserService(); 
  }
  async getUsers(req, res) {
    try {
      console.log('req.decode:', req.decode);
      const users = await this.userService.getUsers(req.decode.uid);
      res.json({ success: true, data: users });
    } catch (error) {
      console.error('Error in getUsers controller:', error);
      res.status(error.status || 500).json({ success: false, msg: error.message });
    }
  }

  async updateUser(req, res) {
    try {
      await this.userService.updateUser(req.body);
      res.json({ success: true, msg: 'User was updated' });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message || 'Something went wrong' });
    }
  }

  async autoLogin(req, res) {
    try {
      const token = await this.userService.autoLogin(req.body.uid);
      res.json({ success: true, token });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  }

  async deleteUser(req, res) {
    try {
      await this.userService.deleteUser(req.body.id);
      res.json({ success: true, msg: 'User was deleted' });
    } catch (err) {
      res.status(500).json({ success: false, msg: err.message });
    }
  }

  async returnMediaUrl(req, res) {
    try {
      const files = req.files;
      const result = await this.userService.returnMediaUrl(req.decode.uid, files);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ success: false, msg: error.message || 'Something went wrong' });
    }
  }

  async getMe(req, res) {
    try {
      const data = await this.userService.getMe(req.decode.uid);
      res.json(data);
    } catch (error) {
      res.status(error.status || 500).json({ success: false, msg: error.message });
    }
  }

  async saveNote(req, res) {
    try {
      const { chatId, note } = req.body;
      const result = await this.userService.saveNote(req.decode.uid, chatId, note);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async pushTag(req, res) {
    try {
      const { tag, chatId } = req.body;
      const result = await this.userService.pushTag(req.decode.uid, tag, chatId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async deleteTag(req, res) {
    try {
      const { tag, chatId } = req.body;
      const result = await this.userService.deleteTag(req.decode.uid, tag, chatId);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async checkContact(req, res) {
    try {
      const { mobile } = req.body;
      const result = await this.userService.checkContact(req.decode.uid, mobile);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async saveContact(req, res) {
    try {
      const result = await this.userService.saveContact(req.decode.uid, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async deleteContact(req, res) {
    try {
      const result = await this.userService.deleteContact(req.body.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async updateProfile(req, res) {
    try {
      const result = await this.userService.updateProfile(req.decode.uid, req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async getDashboard(req, res) {
    try {
      const result = await this.userService.getDashboard(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async addTaskForAgent(req, res) {
    try {
      const { title, des, agent_uid } = req.body;
      const result = await this.userService.addTaskForAgent(req.decode.uid, title, des, agent_uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async getMyAgentTasks(req, res) {
    try {
      const result = await this.userService.getMyAgentTasks(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async deleteTaskForAgent(req, res) {
    try {
      const result = await this.userService.deleteTaskForAgent(req.decode.uid, req.body.id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async updateAgentProfile(req, res) {
    try {
      const result = await this.userService.updateAgentProfile(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async fetchProfile(req, res) {
    try {
      const result = await this.userService.fetchProfile(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async verify(req, res) {
    try {
      let token = req.headers.authorization?.split(' ')[1];
      if (!token) throw new HttpException('Invalid token provided', 400);
      const user = await this.userService.verifyToken(token);
      res.status(200).json({ user });
    } catch (error) {
      res.status(400).json({ message: 'Token expired' });
    }
  }

  async loginWithFacebook(req, res) {
    try {
      const result = await this.userService.loginWithFacebook(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async loginWithGoogle(req, res) {
    try {
      const result = await this.userService.loginWithGoogle(req.body.token);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async signup(req, res) {
    try {
      const result = await this.userService.signup(req.body);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async login(req, res) {
    try {
      const result = await this.userService.login(req.body);
      res.json(result);
    } catch (error) {
      res.status(error.status || 500).json({ message: error.message || 'Something went wrong' });
    }
  }

  async sendRecovery(req, res) {
    try {
      const result = await this.userService.sendRecovery(req.body.email);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async modifyPassword(req, res) {
    try {
      const result = await this.userService.modifyPassword(req.decode, req.query.pass);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async generateApiKeys(req, res) {
    try {
      const result = await this.userService.generateApiKeys(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async autoAgentLogin(req, res) {
    try {
      const result = await this.userService.autoAgentLogin(req.body.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }
}

module.exports = UserController; 