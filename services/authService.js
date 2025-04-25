const bcrypt = require("bcrypt");
const { sign } = require("jsonwebtoken");
const moment = require("moment");
const { isValidEmail } = require("../functions/function");
const { generateToken, verifyToken, decodeGoogleToken } = require('../utils/authUtils');
const { validateFacebookToken } = require('../utils/metaUtils');
const randomstring = require('randomstring');
const { welcomeEmail, recoverEmail } = require('../emails/returnEmails');
const HttpException = require('../middlewares/HttpException');
const { user: User } = require('../models'); 
const WebRepository = require('../repositories/webRepository');
const sendEmail = require('../functions/function'); 

class AuthService {
  async verifyToken(token) {
    const decoded = verifyToken(token);
    const user = await User.findOne({ where: { uid: decoded.uid } });
    if (!user) throw new HttpException('User not found', 400);
    return {
      id: user.uid,
      name: user.name,
      email: user.email
    };
  }

  async loginWithFacebook({ token, userId, email, name }) {
    if (!token || !userId || !email || !name) {
      return { success: false, msg: 'Login can not be completed, Input not provided' };
    }
    const web = await WebRepository.getWebPublic();
    const appId = web?.fb_login_app_id;
    const appSec = web?.fb_login_app_sec;
    if (!appId || !appSec) {
      return { success: false, msg: 'Please fill the app ID and secret from the admin panel to complete facebook login' };
    }
    const checkToken = await validateFacebookToken(token, appId, appSec);
    if (!checkToken?.success) {
      return { success: false, msg: 'Can not complete your facebook login some parameters could not match' };
    }
    const resp = checkToken?.response?.data;
    if (resp?.user_id !== userId || !resp?.is_valid) {
      return { success: false, msg: 'The login token found invalid' };
    }
    let user = await User.findOne({ where: { email } });
    if (!user) {
      const uid = randomstring.generate();
      const password = userId;
      const hasPass = await bcrypt.hash(password, 10);
      user = await User.create({ name, uid, email, password: hasPass });
    }
    const loginToken = generateToken({ uid: user.uid, role: 'user' });
    return { success: true, token: loginToken };
  }

  async loginWithGoogle(token) {
    if (!token) {
      return { success: false, msg: 'Please check your token, it is not valid' };
    }
    const decoded = decodeGoogleToken(token);
    if (!decoded?.payload?.email || !decoded?.payload?.email_verified) {
      return { success: false, msg: 'Could not complete google login' };
    }
    const email = decoded.payload.email;
    const name = decoded.payload.name;
    let user = await User.findOne({ where: { email } });
    if (!user) {
      const uid = randomstring.generate();
      const password = decoded.header?.kid;
      const hasPass = await bcrypt.hash(password, 10);
      user = await User.create({ name, uid, email, password: hasPass });
    }
    const loginToken = generateToken({ uid: user.uid, role: 'user' });
    return { success: true, token: loginToken };
  }

  async signup({ email, name, password, mobile_with_country_code, acceptPolicy }) {
    if (!email || !name || !password || !mobile_with_country_code) {
      return { success: false, msg: 'Please fill the details' };
    }
    if (!acceptPolicy) {
      return { success: false, msg: 'You did not click on checkbox of Privacy & Terms' };
    }
    if (!isValidEmail(email)) {
      return { success: false, msg: 'Please enter a valid email' };
    }
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return { success: false, msg: 'A user already exists with this email' };
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
    return { success: true, msg: 'Signup Success' };
  }

  async login({ email, password }) {
    if (!email || !password) {
      throw new HttpException('Please provide email and password', 400);
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new HttpException('Invalid credentials', 400);
    }
    const compare = await bcrypt.compare(password, user.password);
    if (!compare) {
      throw new HttpException('Invalid credentials', 400);
    }
    const token = generateToken({ uid: user.uid, role: 'user' });
    return {
      token,
      user: { id: user.uid, name: user.name, email: user.email }
    };
  }

  async sendRecovery(email) {
    if (!isValidEmail(email)) {
      return { success: false, msg: 'Please enter a valid email' };
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return { success: true, msg: 'We have sent a recovery link if this email is associated with a user account.' };
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
      return { success: false, msg: 'SMTP connections not found! Unable to send recovery link' };
    }
    await sendEmail(smtp.host, smtp.port, smtp.email, smtp.password, html, `${appName} - Password Recovery`, smtp.email, email);
    return { success: true, msg: 'We have sent you a password recovery link. Please check your email' };
  }

  async modifyPassword(decoded, pass) {
    if (!pass) {
      return { success: false, msg: 'Please provide a password' };
    }
    if (moment(decoded.time).diff(moment(new Date()), 'hours') > 1) {
      return { success: false, msg: 'Token expired' };
    }
    const hashpassword = await bcrypt.hash(pass, 10);
    const result = await User.update({ password: hashpassword }, { where: { email: decoded.old_email } });
    return { success: true, msg: 'Your password has been changed. You may login now! Redirecting...', data: result };
  }

  async generateApiKeys(uid) {
    const token = generateToken({ uid, role: 'user' });
    await User.update({ api_key: token }, { where: { uid } });
    return { success: true, token, msg: 'New keys have been generated' };
  }
}

module.exports = AuthService;
