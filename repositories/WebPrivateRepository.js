const { WebPrivate } = require("../models");
const Repository = require("./Repository");

class WebPrivateRepository extends Repository {
  constructor() {
    super(WebPrivate);
  }

  async updateWebPrivate(data) {
    const [record, created] = await WebPrivate.findOrCreate({
      where: { id: 1 },
      defaults: { ...data, id: 1 },
    });
    if (!created) {
      await record.update(data);
    }

    return record;
  }

  async getWebPrivate() {
    try {
      return await WebPrivate.findOne();
    } catch (error) {
      console.error("Error fetching WebPrivate:", error);
      throw error;
    }
  }

    async getStripeKeys() {
    const result = await this.findFirst();
    return {
      publishableKey: result?.pay_stripe_id,
      secretKey: result?.pay_stripe_key
    };
  }


  async getWebPrivateDetails() {
    return await WebPrivate.findOne({ where: { id: 1 } });
  }

  async findPaymentById(id) {
    return await this.findByPk(id);
  }
}

module.exports = WebPrivateRepository;
