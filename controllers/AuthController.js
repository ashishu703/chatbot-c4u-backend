const AuthService = require('../services/AuthService');
const HttpException = require('../middlewares/HttpException');
const TokenMissingOrInvalidExecption = require('../exceptions/CustomExceptions/TokenMissingOrInvalidExecption');
const TokenMalformedExecption = require('../exceptions/CustomExceptions/TokenMalformedExecption');
const {formSuccess} = require("../utils/response.utils");
class AuthController {
  authService;

  constructor() {
    this.authService = new AuthService(); 
  }
 
  async verify(req, res, next) {
    try {
      let token = req.headers.authorization;
      if (!token) {
        throw new TokenMissingOrInvalidExecption();
      }
      token = token.split(' ')[1]; 
      if (!token) {
        throw new TokenMalformedExecption();
      }
      const user = await this.authService.verifyToken(token);
      return formSuccess({ user });
    } catch (err) {
    
      next(err);
    }
  }
  
  

  async loginWithFacebook(req, res, next) {  
    try {
      const { token, userId, email, name } = req.body;
      const loginToken = await this.authService.loginWithFacebook({ token, userId, email, name });
      return formSuccess({token: loginToken});
    } catch (err) {
      next(err);
    }
  }

  async loginWithGoogle(req, res, next) {
    try {
      const loginToken = await this.authService.loginWithGoogle(req.body.token);
      return formSuccess({token:loginToken});
    } catch (err) {
     next(err);
    }
  }


  async signup(req, res, next) {
    try {
      const { email, name, password, mobile_with_country_code, acceptPolicy } = req.body;
      await this.authService.signup({ email, name, password, mobile_with_country_code, acceptPolicy });
      return formSuccess({msg: __t("signup_success") });
    } catch (err) {
      next(err);
    }
  }

  async userlogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.userlogin({ email, password });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async adminlogin(req, res, next) {
    try {
      const { email, password } = req.body;
      const result = await this.authService.adminlogin({ email, password });
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async sendRecovery(req, res, next) {
    try {
      const { email } = req.body;
      await this.authService.sendRecovery(email);
      return formSuccess({ msg:__t("password_recovery_link_sent") });
    } catch (err) {
      next(err);
    }
  }

  async modifyPassword(req, res, next) {
    try {
      const { pass } = req.query;
      await this.authService.modifyPassword(req.decode, pass);
      return formSuccess({ msg:__t("password_changed_success")});
    } catch (err) {
      next(err);
    }
  }

  async generateApiKeys(req, res, next) {
    try {
      await this.authService.generateApiKeys(req.decode.uid);
      return formSuccess({msg:__t("new_keys_generated")});
    } catch (err) {
      next(err);
    }
  }

  async autoAgentLogin(req, res, next) {
    try {
      const { uid } = req.body;
      const result = await this.authService.autoAgentLogin(uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AuthController;
