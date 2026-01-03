const { CommerceSettings } = require("../models");
const Repository = require("./Repository");

class CommerceSettingsRepository extends Repository {
  constructor() {
    super(CommerceSettings);
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

module.exports = CommerceSettingsRepository;
