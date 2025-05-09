const { WebPublic } = require("../models");

class WebPublicRepository {
   async getWebPublic() {
    return await WebPublic.findOne();
  }

   async updateSocialLogin(google_client_id, google_login_active) {
    const existing = await WebPublic.findOne();
    if (existing) {
      await WebPublic.update({ google_client_id, google_login_active }, { where: { id: existing.id } });
    } else {
      await WebPublic.create({ google_client_id, google_login_active });
    }
  }

   async updateRtl(rtl) {
    const existing = await WebPublic.findOne();
    if (existing) {
      await WebPublic.update({ rtl }, { where: { id: existing.id } });
    } else {
      await WebPublic.create({ rtl });
    }
  }
}

module.exports = WebPublicRepository;