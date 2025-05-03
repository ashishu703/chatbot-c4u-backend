const { Smtp } = require("../models");

class SmtpRepository {
  static async getSmtp() {
    return await Smtp.findOne();
  }

  static async updateSmtp({ email, port, password, host }) {
    if (!email || !port || !password || !host) {
      throw new Error("Please fill all the fields");
    }
    const existing = await Smtp.findOne();
    if (existing) {
      await Smtp.update({ email, host, port, password }, { where: { id: existing.id } });
    } else {
      await Smtp.create({ email, host, port, password });
    }
  }
}

module.exports = SmtpRepository;