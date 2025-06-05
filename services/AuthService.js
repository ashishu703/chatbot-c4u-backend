const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { isValidEmail, sendEmail } = require("../functions/function");
const { generateToken, comparePassword } = require("../utils/auth.utils");
const { validateFacebookToken } = require("../utils/meta-api.utils");
const { recoverEmail } = require("../emails/returnEmails");
const { User } = require("../models");
const WebPublicRepository = require("../repositories/WebPublicRepository");
const TokenExpiredEXception = require("../exceptions/CustomExceptions/TokenExpiredEXception");
const TokenMissingOrInvalidExecption = require("../exceptions/CustomExceptions/TokenMissingOrInvalidExecption");
const TokenVerificationFailedException = require("../exceptions/CustomExceptions/TokenVerificationFailedException");
const LoginInputMissingException = require("../exceptions/CustomExceptions/LoginInputMissingException");
const FacebookAppCredentialsMissingException = require("../exceptions/CustomExceptions/FacebookAppCredentialsMissingException");
const FacebookLoginParamMismatchException = require("../exceptions/CustomExceptions/FacebookLoginParamMismatchException");
const InvalidLoginTokenException = require("../exceptions/CustomExceptions/InvalidLoginTokenException");
const GoogleLoginFailedException = require("../exceptions/CustomExceptions/GoogleLoginFailedException");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const PrivacyTermsUncheckedException = require("../exceptions/CustomExceptions/PrivacyTermsUncheckedException");
const EmailAlreadyInUseException = require("../exceptions/CustomExceptions/EmailAlreadyInUseException");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const RecoveryUserNotFoundException = require("../exceptions/CustomExceptions/RecoveryUserNotFoundException");
const SmtpConnectionNotFoundException = require("../exceptions/CustomExceptions/SmtpConnectionNotFoundException");
const PasswordRequiredException = require("../exceptions/CustomExceptions/PasswordRequiredException");
const { USER } = require("../types/roles.types");
const { jwtKey } = require("../config/app.config");
const EmailService = require("./emailService");
const UserRepository = require("../repositories/UserRepository");
const {
  decodeToken,
  generateUid,
  encryptPassword,
} = require("../utils/auth.utils");

class AuthService {
  constructor() {
    this.emailService = new EmailService();
    this.webPublicRepository = new WebPublicRepository();
    this.userRepository = new UserRepository();
  }

  async verifyToken(token) {
    return new Promise((resolve, reject) => {
      jwt.verify(token, jwtKey, (err, decoded) => {
        if (err) {
          console.error("JWT Verification failed:", err.message);
          if (err.name === "TokenExpiredError") {
            return reject(new TokenExpiredEXception());
          } else if (err.name === "JsonWebTokenError") {
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

    const web = await this.webPublicRepository.getWebPublic();
    const appId = web?.fb_login_app_id;
    const appSec = web?.fb_login_app_sec;
    if (!appId || !appSec) {
      throw new FacebookAppCredentialsMissingException();
    }

    const resp = checkToken?.response?.data;
    if (resp?.user_id !== userId || !resp?.is_valid) {
      throw new InvalidLoginTokenException();
    }

    let user = await this.userRepository.findFirst({ where: { email } });
    if (!user) {
      const uid = generateUid();
      const password = userId;
      const hasPass = await encryptPassword(password);
      user = await this.userRepository.create({
        name,
        uid,
        email,
        password: hasPass,
      });
    }

    return generateToken({ uid: user.uid, role: USER });
  }

  async loginWithGoogle(token) {
    if (!token) {
      throw new TokenMissingOrInvalidExecption();
    }

    const decoded = decodeToken(token);
    if (!decoded?.payload?.email || !decoded?.payload?.email_verified) {
      throw new GoogleLoginFailedException();
    }

    const email = decoded.payload.email;
    const name = decoded.payload.name;
    let user = await this.userRepository.findByEmail(email);
    if (!user) {
      const uid = generateUid();
      const password = decoded.header?.kid;
      const hashedPassword = await encryptPassword(password);

      user = await this.userRepository.create({
        name,
        uid,
        email,
        password: hashedPassword,
      });
    }

    return generateToken({
      uid: user.uid,
      role: USER,
      password: user.password,
      email: user.email,
    });
  }

  async signup({
    email,
    name,
    password,
    mobile_with_country_code,
    acceptPolicy,
  }) {
    if (!email || !name || !password || !mobile_with_country_code) {
      throw new FillAllFieldsException();
    }

    if (!acceptPolicy) {
      throw new PrivacyTermsUncheckedException();
    }

    if (!isValidEmail(email)) {
      throw new InvalidCredentialsException();
    }

    const existingUser = await this.userRepository.findFirst({
      where: { email },
    });
    if (existingUser) {
      throw new EmailAlreadyInUseException();
    }

    const haspass = await encryptPassword(password);
    const uid = generateUid();
    const user = await this.userRepository.create({
      name,
      uid,
      email,
      password: haspass,
      mobile_with_country_code,
    });
    this.emailService.sendWelcomeEmail(email, name).catch((err) => {
      console.log("Unable to send Welcome Email", { email, name, err });
    });
    return user;
  }

  async userlogin({ email, password }) {
    if (!email || !password) {
      throw new FillAllFieldsException();
    }

    const user = await this.userRepository.findFirst({ where: { email } });
    if (!user) {
      throw new InvalidCredentialsException();
    }

    const compare = await comparePassword(password, user.password);
    if (!compare) {
      throw new InvalidCredentialsException();
    }

    const token = generateToken({ uid: user.uid, role: USER });
    return {
      token,
      user: { id: user.uid, name: user.name, email: user.email },
    };
  }

  async sendRecovery(email) {
    if (!isValidEmail(email)) {
      throw new InvalidCredentialsException();
    }
    const user = await User.findOne({ where: { email } });
    console.log({ user, email });
    if (!user) {
      throw new RecoveryUserNotFoundException();
    }
    const web = await this.webPublicRepository.getWebPublic();
    const appName = web?.app_name || "App";
    const token = generateToken({
      old_email: email,
      email,
      time: moment(new Date()),
      password: user.password,
      role: USER,
    });
    const recoveryUrl = `${process.env.FRONTENDURI}/recovery-user/${token}`;
    const html = recoverEmail(appName, recoveryUrl);
    const smtp = await WebRepository.getSmtp();
    if (!smtp?.email || !smtp?.host || !smtp?.port || !smtp?.password) {
      throw new SmtpConnectionNotFoundException();
    }
    await sendEmail(
      smtp.host,
      smtp.port,
      smtp.email,
      smtp.password,
      html,
      `${appName} - Password Recovery`,
      smtp.email,
      email
    );
    return true;
  }

  async modifyPassword(decoded, pass) {
    if (!pass) {
      throw new PasswordRequiredException();
    }
    if (moment(decoded.time).diff(moment(new Date()), "hours") > 1) {
      throw new TokenExpiredEXception();
    }
    const hashpassword = await bcrypt.hash(pass, 10);
    const result = await User.update(
      { password: hashpassword },
      { where: { email: decoded.old_email } }
    );
    return result;
  }

  async generateApiKeys(uid) {
    const token = generateToken({ uid, role: USER });
    await User.update({ api_key: token }, { where: { uid } });
    return true;
  }
}

module.exports = AuthService;
