const { WebPrivate } = require("../models/web_private");

class PaymentRepository {
  static async getPaymentGateway() {
    return await WebPrivate.findOne();
  }

  static async updatePaymentGateway(data) {
    const existing = await WebPrivate.findOne();
    if (existing) {
      await WebPrivate.update(data, { where: { id: existing.id } });
    } else {
      await WebPrivate.create(data);
    }
  }
}

module.exports = PaymentRepository;