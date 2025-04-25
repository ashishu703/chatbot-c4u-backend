const EmailService = require("../services/emailService");
const SmtpRepository = require("../repositories/smtpRepository");

class SmtpController {
  static async getSmtp(req, res) {
    try {
      const smtp = await SmtpRepository.getSmtp();
      res.json({ data: smtp || { id: "ID" }, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }

  static async updateSmtp(req, res) {
    try {
      const smtpData = req.body;
      await SmtpRepository.updateSmtp(smtpData);
      res.json({ success: true, msg: "Email settings was updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async sendTestEmail(req, res) {
    try {
      const { email, port, password, host, to } = req.body;
      const result = await EmailService.sendTestEmail({ email, port, password, host, to });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }
}

module.exports = SmtpController;