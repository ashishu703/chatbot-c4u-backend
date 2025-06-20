const MediaService = require("../services/mediaService");
const { formSuccess } = require("../utils/response.utils");

class MediaController {
  constructor() {
    this.mediaService = new MediaService();
  }

  async returnMediaUrl(req, res, next) {
    try {
      const result = await this.mediaService.handleMediaUpload(req.files);
      return formSuccess(res,result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MediaController;
