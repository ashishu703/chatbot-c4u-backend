const { Smtp } = require("../models");
const Repository = require("./Repository");

class SmtpRepository extends Repository {
  constructor() {
    super(Smtp);
  }
  async getSmtp() {
    return this.findFirst();
  }

  async updateSmtp({ email, port, password, host }) {
    return this.updateOrCreate({ email, port, password, host }, { id: 1 });
  }
}

module.exports = SmtpRepository;
