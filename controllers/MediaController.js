const MediaService = require("../services/mediaService");

class MediaController {
  constructor() {
    this.mediaService = new MediaService();
  }

  async returnMediaUrl(req, res) {
    try {
      const result = await this.mediaService.handleMediaUpload(req.files);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: "something went wrong", err });
    }
  }
}

module.exports = MediaController;
