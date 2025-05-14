const WebPublicRepository = require("../repositories/webPublicRepository");

class SocialController {
  webPublicRepository;
  constructor(){
    this.webPublicRepository = new WebPublicRepository();
  }
   async getWebPublic(req, res, next) {
    try {
      const data = await this.webPublicRepository.getWebPublic();
      res.json({ data: data || {}, success: true });
    } catch (err) {
      next(err);
    }
  }

   async getSocialLogin(req, res, next) {
    try {
      const data = await this.webPublicRepository.getWebPublic();
      res.json({ data: data || {}, success: true });
    } catch (err) {
      next(err);
    }
  }

   async updateSocialLogin(req, res, next) {
    try {
      const { google_client_id, google_login_active } = req.body;
      await this.webPublicRepository.updateSocialLogin(google_client_id, google_login_active);
      res.json({ msg: "Settings updated", success: true });
    } catch (err) {
      next(err);
    }
  }

   async updateRtl(req, res, next) {
    try {
      const { rtl } = req.body;
      await this.webPublicRepository.updateRtl(rtl);
      res.json({ success: true, msg: "RTL was updated" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = SocialController;