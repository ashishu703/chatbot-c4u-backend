const { sendEmail } = require("../functions/function");
const SmtpRepository = require("../repositories/smtpRepository");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const { getRecoverEmailTemplate, getWelcomeEmailTemplate } = require("../emails/returnEmails");
const WebPublicRepository = require("../repositories/WebPublicRepository");
class EmailService {
  smtpConfig;
  appConfig;

  constructor() {
  }

  async initConfig() {
    try {
      this.appConfig = await (new WebPublicRepository()).getWebPublic();
      this.smtpConfig = await (new SmtpRepository()).getSmtp();
    } catch (error) {
      console.error("Failed to initialize configs:", error);
      throw new Error("Configuration initialization failed");
    }
  }

  async sendRecoveryEmail(to, url) {
    await this.initConfig();
    const { app_name } = this.appConfig;
    const template = getRecoverEmailTemplate(app_name, url);
    return this.sendEmailTemplate(template, to);
  }

  async sendWelcomeEmail(to, username) {
    await this.initConfig();
    const { app_name } = this.appConfig;
    const template = getWelcomeEmailTemplate(app_name, username);
    return this.sendEmailTemplate(template, to);
  }

  async sendEmailTemplate(template, to) {
    if (!this.appConfig || !this.smtpConfig) {
      return console.log("Failed to initialize configs");
    }

    const {
      email, host, port, password
    } = this.smtpConfig;
    const { app_name } = this.appConfig; 

    return sendEmail(
      host,
      port,
      email,
      password,
      template,
      `${app_name} - Password Recovery`,
      email,
      to
    );
  }

  async sendTestEmail({ email, port, password, host, to }) {
    if (!email || !port || !password || !host) {
      throw new FillAllFieldsException();
    }
    return await sendEmail(
      host,
      port,
      email,
      password,
      `<h1>This is a test SMTP email!</h1>`,
      "SMTP Testing",
      "Testing Sender",
      to
    );
  }
}

module.exports = EmailService;
