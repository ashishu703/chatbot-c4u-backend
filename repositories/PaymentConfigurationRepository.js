const { PaymentConfiguration } = require("../models");
const Repository = require("./Repository");

class PaymentConfigurationRepository extends Repository {
  constructor() {
    super(PaymentConfiguration);
  }

  async getConfigurationsByUid(uid) {
    return this.find({
      where: { uid },
      order: [["createdAt", "DESC"]],
    });
  }

  async getConfigurationById(id, uid) {
    return this.findFirst({
      where: { id, uid },
    });
  }

  async createConfiguration(data) {
    return this.create(data);
  }

  async updateConfiguration(id, uid, data) {
    return this.update(data, { id, uid });
  }

  async deleteConfiguration(id, uid) {
    return this.delete({ id, uid });
  }
}

module.exports = PaymentConfigurationRepository;
