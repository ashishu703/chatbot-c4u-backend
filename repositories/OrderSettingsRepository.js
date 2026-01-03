const { OrderSettings } = require("../models");
const Repository = require("./Repository");

class OrderSettingsRepository extends Repository {
  constructor() {
    super(OrderSettings);
  }

  async getSettingsByUid(uid) {
    return this.findFirst({
      where: { uid },
    });
  }

  async createOrUpdateSettings(uid, data) {
    return this.updateOrCreate(data, { uid });
  }

  async updateSettings(uid, data) {
    return this.update(data, { uid });
  }
}

module.exports = OrderSettingsRepository;
