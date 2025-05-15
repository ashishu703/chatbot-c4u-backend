const WebPublicRepository = require("../repositories/webPublicRepository");
const { formSuccess } = require("../utils/response.utils");

class SocialController {
  webPublicRepository;
  constructor(){
    this.webPublicRepository = new WebPublicRepository();
  }
   async getWebPublic(req, res, next) {
    try {
      const data = await this.webPublicRepository.getWebPublic();
      return formSuccess({ data: data || {} });
    } catch (err) {
      next(err);
    }
  }

   async getSocialLogin(req, res, next) {
    try {
      const data = await this.webPublicRepository.getWebPublic();
      return formSuccess({ data: data || {} });
    } catch (err) {
      next(err);
    }
  }

   async updateSocialLogin(req, res, next) {
    try {
      const { google_client_id, google_login_active } = req.body;
      await this.webPublicRepository.updateSocialLogin(google_client_id, google_login_active);
      return formSuccess({ msg: "Settings updated" });
    } catch (err) {
      next(err);
    }
  }

   async updateRtl(req, res, next) {
    try {
      const { rtl } = req.body;
      await this.webPublicRepository.updateRtl(rtl);
      return formSuccess({ msg: "RTL was updated" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SocialController;