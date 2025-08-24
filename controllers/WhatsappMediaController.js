const WhatsappMediaService = require('../services/WhatsappMediaService');
const { formSuccess } = require('../utils/response.utils');

class WhatsappMediaController {
  metaService;
  constructor() {
    this.whatsappMediaService = new WhatsappMediaService();
  }


  async returnMediaUrlMeta(req, res, next) {
    try {
      const { uid } = req.decode;
      const { templet_name } = req.body;
      const {
        url,
        hash
      } = await this.whatsappMediaService.uploadTempleteMedia(uid, templet_name,req)
      return formSuccess(res, { url, hash });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WhatsappMediaController;