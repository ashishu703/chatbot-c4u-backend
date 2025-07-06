const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const { generateToken, comparePassword } = require("../utils/auth.utils");
const { User } = require("../models");
const WebPublicRepository = require("../repositories/WebPublicRepository");
const TokenExpiredEXception = require("../exceptions/CustomExceptions/TokenExpiredEXception");
const TokenMissingOrInvalidExecption = require("../exceptions/CustomExceptions/TokenMissingOrInvalidExecption");
const LoginInputMissingException = require("../exceptions/CustomExceptions/LoginInputMissingException");
const FacebookAppCredentialsMissingException = require("../exceptions/CustomExceptions/FacebookAppCredentialsMissingException");
const InvalidLoginTokenException = require("../exceptions/CustomExceptions/InvalidLoginTokenException");
const GoogleLoginFailedException = require("../exceptions/CustomExceptions/GoogleLoginFailedException");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const PrivacyTermsUncheckedException = require("../exceptions/CustomExceptions/PrivacyTermsUncheckedException");
const EmailAlreadyInUseException = require("../exceptions/CustomExceptions/EmailAlreadyInUseException");
const InvalidCredentialsException = require("../exceptions/CustomExceptions/InvalidCredentialsException");
const RecoveryUserNotFoundException = require("../exceptions/CustomExceptions/RecoveryUserNotFoundException");
const PasswordRequiredException = require("../exceptions/CustomExceptions/PasswordRequiredException");
const { USER } = require("../types/roles.types");
const { jwtKey } = require("../config/app.config");
const EmailService = require("./EmailService");
const UserRepository = require("../repositories/UserRepository");
const {
  decodeToken,
  generateUid,
  encryptPassword,
} = require("../utils/auth.utils");
const { isValidEmail } = require("../utils/validation.utils");

class AuthService {
  constructor() {
    this.emailService = new EmailService();
    this.webPublicRepository = new WebPublicRepository();
    this.userRepository = new UserRepository();
  }

  async verifyToken(token) {
    return jwt.verify(token, jwtKey);
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

    return generateToken({ id: user.uid, uid: user.uid, name: user.name, email: user.email, role: USER });
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

    return generateToken({ id: user.uid, uid: user.uid, name: user.name, email: user.email, role: USER });
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


    const existingUser = await this.userRepository.findByEmail(email);
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
    this.emailService.sendWelcomeEmail(email, name);

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

    const token = generateToken({ id: user.uid, uid: user.uid, name: user.name, email: user.email, role: USER });
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
    const token = generateToken({
      old_email: email,
      email,
      time: moment(new Date()),
      password: user.password,
      role: USER,
    });
    const url = `${process.env.FRONTENDURI}/recovery-user/${token}`;
    return this.emailService.sendRecoveryEmail(email, url);
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
