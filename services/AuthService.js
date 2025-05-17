const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { isValidEmail, sendEmail } = require("../functions/function");
const { generateToken, decodeGoogleToken } = require('../utils/authUtils');
const { validateFacebookToken } = require('../utils/metaApi');
const randomstring = require('randomstring');
const { welcomeEmail, recoverEmail } = require('../emails/returnEmails');
const HttpException = require('../middlewares/HttpException');
const { User,Admin } = require('../models'); 
const WebRepository = require('../repositories/webRepository'); 
const TokenExpiredEXception = require("../exceptions/CustomExceptions/TokenExpiredEXception");
const TokenMissingOrInvalidExecption = require("../exceptions/CustomExceptions/TokenMissingOrInvalidExecption")
const TokenVerificationFailedException = require ("../exceptions/CustomExceptions/TokenVerificationFailedException")
const LoginInputMissingException = require ("../exceptions/CustomExceptions/LoginInputMissingException")
const FacebookAppCredentialsMissingException = require ("../exceptions/CustomExceptions/FacebookAppCredentialsMissingException")
const FacebookLoginParamMismatchException = require ("../exceptions/CustomExceptions/FacebookLoginParamMismatchException")
const InvalidLoginTokenException = require ("../exceptions/CustomExceptions/InvalidLoginTokenException")
const GoogleLoginFailedException = require ("../exceptions/CustomExceptions/GoogleLoginFailedException")
const FillAllFieldsException = require ("../exceptions/CustomExceptions/FillAllFieldsException")
const PrivacyTermsUncheckedException = require ("../exceptions/CustomExceptions/PrivacyTermsUncheckedException")
const EmailAlreadyInUseException = require ("../exceptions/CustomExceptions/EmailAlreadyInUseException")
const InvalidCredentialsException = require ("../exceptions/CustomExceptions/InvalidCredentialsException");
const RecoveryUserNotFoundException = require ("../exceptions/CustomExceptions/RecoveryUserNotFoundException")
const SmtpConnectionNotFoundException = require ("../exceptions/CustomExceptions/SmtpConnectionNotFoundException");
const PasswordRequiredException = require ("../exceptions/CustomExceptions/PasswordRequiredException")



class AuthService {
  async verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWTKEY, (err, decoded) => {
        if (err) {
          console.error('JWT Verification failed:', err.message);
          if (err.name === 'TokenExpiredError') {
            return reject(new TokenExpiredEXception());
          } else if (err.name === 'JsonWebTokenError') {
            return reject(new TokenMissingOrInvalidExecption());
          }
          return reject(new TokenVerificationFailedException());
        }
        resolve(decoded); 
      });
    });
  }


  async loginWithFacebook({ token, userId, email, name }) {
    if (!token || !userId || !email || !name) {
      throw new LoginInputMissingException();
    }
    const web = await WebRepository.getWebPublic();
    const appId = web?.fb_login_app_id;
    const appSec = web?.fb_login_app_sec;
    if (!appId || !appSec) {
      throw new FacebookAppCredentialsMissingException();
    }
    const checkToken = await validateFacebookToken(token, appId, appSec);
    if (!checkToken?.success) {
      throw new FacebookLoginParamMismatchException();
    }
    const resp = checkToken?.response?.data;
    if (resp?.user_id !== userId || !resp?.is_valid) {
    throw new InvalidLoginTokenException();
    }
    let user = await User.findOne({ where: { email } });
    if (!user) {
      const uid = randomstring.generate();
      const password = userId;
      const hasPass = await bcrypt.hash(password, 10);
      user = await User.create({ name, uid, email, password: hasPass });
    }
    const loginToken = generateToken({ uid: user.uid, role: 'user' });
    return loginToken;
  }

  async loginWithGoogle(token) {
    if (!token) {
      throw new TokenMissingOrInvalidExecption();
    }

    const decoded = jwt.decode(token, { complete: true });
    if (!decoded?.payload?.email || !decoded?.payload?.email_verified) {
      throw new GoogleLoginFailedException();
    }

    const email = decoded.payload.email;
    const name = decoded.payload.name;
    const user = await this.authRepository.findByEmail(email);

    if (!user) {
      const uid = randomstring.generate();
      const password = decoded.header?.kid;
      const hashedPassword = await bcrypt.hash(password, 10);

      await this.authRepository.createUser({ name, uid, email, password: hashedPassword });

      const loginToken = jwt.sign({ uid, role: "user", email, password: hashedPassword }, process.env.JWTKEY);
      return loginToken;
    }

    const loginToken = jwt.sign(
      { uid: user.uid, role: "user", password: user.password, email: user.email },
      process.env.JWTKEY
    );

    return loginToken;
  }


  async signup({ email, name, password, mobile_with_country_code, acceptPolicy }) {
    if (!email || !name || !password || !mobile_with_country_code) {
     throw new FillAllFieldsException();
    }
    if (!acceptPolicy) {
     throw new PrivacyTermsUncheckedException();
    }
    if (!isValidEmail(email)) {
      throw new InvalidCredentialsException();
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new EmailAlreadyInUseException();
    }
    const haspass = await bcrypt.hash(password, 10);
    const uid = randomstring.generate();
    await User.create({ name, uid, email, password: haspass, mobile_with_country_code });
    const web = await WebRepository.getWebPublic();
    const appName = web?.app_name || 'App';
    const smtp = await WebRepository.getSmtp();
    if (smtp?.email && smtp?.host && smtp?.port && smtp?.password) {
      const html = welcomeEmail(appName, name);
      await sendEmail(smtp.host, smtp.port, smtp.email, smtp.password, html, `${appName} - Welcome`, smtp.email, email);
    }
    return true;
  }

  async userlogin({ email, password }) {
  
      if (!email || !password) {
        throw new FillAllFieldsException();
      }
  
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new InvalidCredentialsException();
      }
  
      const compare = await bcrypt.compare(password, user.password);
      if (!compare) {
        throw new InvalidCredentialsException();
      }
  
      const token = generateToken({ uid: user.uid, role: 'user' });
      return {
        token,
        user: { id: user.uid, name: user.name, email: user.email }
      };
  }

  async adminlogin({ email, password }) {
  
      if (!email || !password) {
          throw new FillAllFieldsException();
      }

      const admin = await Admin.findOne({ where: { email } });
      if (!admin) {
       throw new InvalidCredentialsException();
      }
  
      const compare = await bcrypt.compare(password, admin.password);
      if (!compare) {
       throw new InvalidCredentialsException();
      }
  
      const token = generateToken({ uid: admin.uid, role: 'admin' });
      console.log("🟢 Token Generated:", token);
  
      return {
        token,
        admin: { id: admin.uid,email: admin.email }
      };
  }
  async sendRecovery(email) {
    if (!isValidEmail(email)) {
      throw new InvalidCredentialsException();
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new RecoveryUserNotFoundException();
    }
    const web = await WebRepository.getWebPublic();
    const appName = web?.app_name || 'App';
    const token = generateToken({
      old_email: email,
      email,
      time: moment(new Date()),
      password: user.password,
      role: 'user'
    });
    const recoveryUrl = `${process.env.FRONTENDURI}/recovery-user/${token}`;
    const html = recoverEmail(appName, recoveryUrl);
    const smtp = await WebRepository.getSmtp();
    if (!smtp?.email || !smtp?.host || !smtp?.port || !smtp?.password) {
     throw new SmtpConnectionNotFoundException();
    }
    await sendEmail(smtp.host, smtp.port, smtp.email, smtp.password, html, `${appName} - Password Recovery`, smtp.email, email);
    return true;
  }

  async modifyPassword(decoded, pass) {
    if (!pass) {
     throw new PasswordRequiredException();
    }
    if (moment(decoded.time).diff(moment(new Date()), 'hours') > 1) {
      throw new TokenExpiredEXception();
    }
    const hashpassword = await bcrypt.hash(pass, 10);
    const result = await User.update({ password: hashpassword }, { where: { email: decoded.old_email } });
    return result; 
  }

  async generateApiKeys(uid) {
    const token = generateToken({ uid, role: 'user' });
    await User.update({ api_key: token }, { where: { uid } });
    return true;
  }


}

module.exports = AuthService;
