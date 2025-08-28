const WebPublicRepository = require("../repositories/WebPublicRepository");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils")

class SocialController {
  webPublicRepository;
  constructor() {
    this.webPublicRepository = new WebPublicRepository();
  }
  async getWebPublic(req, res, next) {
    try {
      const data = await this.webPublicRepository.getWebPublic();
      return formSuccess(res, { data: data || {} });
    } catch (err) {
      next(err);
    }
  }

  async getSocialLogin(req, res, next) {
    try {
      const data = await this.webPublicRepository.getWebPublic();
      return formSuccess(res, { data: data || {} });
    } catch (err) {
      next(err);
    }
  }

  async updateSocialLogin(req, res, next) {
    try {
      console.log("req",req.body);
      const { google_client_id, google_login_active } = req.body;
      await this.webPublicRepository.updateGoogleLoginCredentials(google_client_id, google_login_active);
      return formSuccess(res,{ msg: __t("settings_updated"),
      });
    } catch (err) {
      next(err);
    }
  }

  async updateRtl(req, res, next) {
    try {
      const { rtl } = req.body;
      await this.webPublicRepository.updateRtl(rtl);
      return formSuccess(res, {
        msg: __t("rtl_updated"),

      });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SocialController;