const { WebPrivate } = require("../models");

class PaymentRepository {
  async getPaymentGateway() {
    return await WebPrivate.findOne();
  }

  async updatePaymentGateway(data) {
    const existing = await WebPrivate.findOne();
    if (existing) {
      await WebPrivate.update(data, { where: { id: existing.id } });
    } else {
      await WebPrivate.create(data);
    }
  }
}

module.exports = PaymentRepository;
