const EmailService = require("../services/emailService");
const SmtpRepository = require("../repositories/smtpRepository");

class SmtpController {
  emailService;
  smtpRepository;
  constructor(){
    this.emailService = new EmailService();
    this.smtpRepository = new SmtpRepository();
  }
   async getSmtp(req, res, next) {
    try {
      const smtp = await this.smtpRepository.getSmtp();
      res.json({ data: smtp || { id: "ID" }, success: true });
    } catch (err) {
      next(err);
    }
  }

   async updateSmtp(req, res, next) {
    try {
      const smtpData = req.body;
      await this.smtpRepository.updateSmtp(smtpData);
      res.json({ success: true, msg: "Email settings was updated" });
    } catch (err) {
      next(err);
    }
  }

   async sendTestEmail(req, res, next) {
    try {
      const { email, port, password, host, to } = req.body;
      const result = await this.emailService.sendTestEmail({ email, port, password, host, to });
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SmtpController;