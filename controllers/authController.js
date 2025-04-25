const AuthService = require('../services/authService');
const HttpException = require('../middlewares/HttpException');

class AuthController {
  authService;

  constructor() {
    this.authService = new AuthService(); 
  }

  async verify(req, res) {
    try {
      let token = req.headers.authorization;
      if (!token) throw new HttpException('Invalid token provided', 400);
      token = token.split(' ')[1];
      const user = await this.authService.verifyToken(token);
      res.status(200).json({ user });
    } catch (error) {
      res.status(400).json({ message: 'Token expired' });
    }
  }

  async loginWithFacebook(req, res) {
    try {
      const { token, userId, email, name } = req.body;
      const result = await this.authService.loginWithFacebook({ token, userId, email, name });
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async loginWithGoogle(req, res) {
    try {
      const { token } = req.body;
      const result = await this.authService.loginWithGoogle(token);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async signup(req, res) {
    try {
      const { email, name, password, mobile_with_country_code, acceptPolicy } = req.body;
      const result = await this.authService.signup({ email, name, password, mobile_with_country_code, acceptPolicy });
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async login(req, res) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.login({ email, password });
      res.status(200).json(result);
    } catch (error) {
      if (error instanceof HttpException) {
        res.status(error.status).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Something went wrong' });
      }
    }
  }

  async sendRecovery(req, res) {
    try {
      const { email } = req.body;
      const result = await this.authService.sendRecovery(email);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async modifyPassword(req, res) {
    try {
      const { pass } = req.query;
      const result = await this.authService.modifyPassword(req.decode, pass);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async generateApiKeys(req, res) {
    try {
      const result = await this.authService.generateApiKeys(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async autoAgentLogin(req, res) {
    try {
      const { uid } = req.body;
      const result = await this.authService.autoAgentLogin(uid);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }
}

module.exports = AuthController;
