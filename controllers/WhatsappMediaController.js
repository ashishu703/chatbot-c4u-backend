const WhatsappMediaApi = require('../api/Whatsapp/WhatsappMediaApi');
const { backendURI } = require('../config/app.config');
const FillAllFieldsException = require('../exceptions/CustomExceptions/FillAllFieldsException');
const MetaApiKeysNotfoundException = require('../exceptions/CustomExceptions/MetaApiKeysNotfoundException');
const SocialAccountRepository = require('../repositories/SocialAccountRepository');
const WhatsappTempleteMediaRepository = require('../repositories/WhatsappTempleteMediaRepository');
const WhatsappMediaService = require('../services/WhatsappMediaService');
const { generateUid } = require('../utils/auth.utils');
const { uploadMetaFiles, getFileInfo } = require('../utils/file.utils');
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
      } = await this.whatsappMediaService.uploadTempleteMedia(uid, templet_name)
      return formSuccess(res, { url, hash });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WhatsappMediaController;