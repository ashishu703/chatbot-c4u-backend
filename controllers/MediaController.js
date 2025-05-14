const MediaService = require("../services/mediaService");

class MediaController {
  constructor() {
    this.mediaService = new MediaService();
  }

  async returnMediaUrl(req, res, next) {
    try {
      const result = await this.mediaService.handleMediaUpload(req.files);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = MediaController;
