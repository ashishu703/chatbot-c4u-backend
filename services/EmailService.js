const { sendEmail } = require("../functions/function");
const SmtpRepository = require("../repositories/smtpRepository");
const SmtpConnectionNotFoundException = require("../exceptions/CustomExceptions/SmtpConnectionNotFoundException");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
class EmailService {
  smtpRepository;
  constructor(){
    this.smtpRepository = new SmtpRepository();
  }
   async sendRecoveryEmail(html, appName, to) {
    const smtp = await this.smtpRepository.getSmtp();
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