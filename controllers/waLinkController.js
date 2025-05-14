const WaLinkService = require('../services/WaLinkService');

class WaLinkController {
  waLinkService;
  constructor() {
    this.waLinkService = new WaLinkService();
  }
  async generateWaLink(req, res, next) {
    try {
      const link = await this.waLinkService.generateWaLink(req.body);
      res.json({ success: true, data: link });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WaLinkController;