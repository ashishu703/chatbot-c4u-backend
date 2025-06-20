const EmailService = require("../services/emailService");
const SmtpRepository = require("../repositories/smtpRepository");
const { formSuccess } = require("../utils/response.utils");
const{ __t }=require("../utils/locale.utils")

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
      return formSuccess(res,{ data: smtp || { id: "ID" }});
    } catch (err) {
      next(err);
    }
  }

   async updateSmtp(req, res, next) {
    try {
      const smtpData = req.body;
      await this.smtpRepository.updateSmtp(smtpData);
      return formSuccess(res,{  msg: __t("email_settings_updated"),

       });
    } catch (err) {
      next(err);
    }
  }

   async sendTestEmail(req, res, next) {
    try {
      const { email, port, password, host, to } = req.body;
      const result = await this.emailService.sendTestEmail({ email, port, password, host, to });
      return formSuccess(res,result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SmtpController;