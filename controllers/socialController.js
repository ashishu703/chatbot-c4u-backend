const WebPublicRepository = require("../repositories/webPublicRepository");

class SocialController {
  webPublicRepository;
  constructor(){
    this.webPublicRepository = new WebPublicRepository();
  }
   async getWebPublic(req, res) {
    try {
      const data = await this.webPublicRepository.getWebPublic();
      res.json({ data: data || {}, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async getSocialLogin(req, res) {
    try {
      const data = await this.webPublicRepository.getWebPublic();
      res.json({ data: data || {}, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async updateSocialLogin(req, res) {
    try {
      const { google_client_id, google_login_active } = req.body;
      await this.webPublicRepository.updateSocialLogin(google_client_id, google_login_active);
      res.json({ msg: "Settings updated", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }

   async updateRtl(req, res) {
    try {
      const { rtl } = req.body;
      await this.webPublicRepository.updateRtl(rtl);
      res.json({ success: true, msg: "RTL was updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Something went wrong" });
    }
  }
}

module.exports = SocialController;