const { sendEmail } = require("../functions/function");
const SmtpRepository = require("../repositories/smtpRepository");

class EmailService {
  static async sendRecoveryEmail(html, appName, to) {
    const smtp = await SmtpRepository.getSmtp();
    if (!smtp?.email || !smtp?.host || !smtp?.port || !smtp?.password) {
      throw new Error("SMTP connections not found! Unable to send recovery link");
    }
    await sendEmail(
      smtp.host,
      smtp.port,
      smtp.email,
      smtp.password,
      html,
      `${appName} - Password Recovery`,
      smtp.email,
      to
    );
  }

  static async sendTestEmail({ email, port, password, host, to }) {
    if (!email || !port || !password || !host) {
      throw new Error("Please fill all the fields");
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