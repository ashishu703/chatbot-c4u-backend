const { WebPublic } = require("../models/WebPublic");

class WebPublicRepository {
  static async getWebPublic() {
    return await WebPublic.findOne();
  }

  static async updateSocialLogin(google_client_id, google_login_active) {
    const existing = await WebPublic.findOne();
    if (existing) {
      await WebPublic.update({ google_client_id, google_login_active }, { where: { id: existing.id } });
    } else {
      await WebPublic.create({ google_client_id, google_login_active });
    }
  }

  static async updateRtl(rtl) {
    const existing = await WebPublic.findOne();
    if (existing) {
      await WebPublic.update({ rtl }, { where: { id: existing.id } });
    } else {
      await WebPublic.create({ rtl });
    }
  }
}

module.exports = WebPublicRepository;