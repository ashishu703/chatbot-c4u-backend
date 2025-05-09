const WaLinkService = require('../services/WaLinkService');

class WaLinkController {
  waLinkService;
  constructor() {
    this.waLinkService = new WaLinkService();
  }
  async generateWaLink(req, res) {
    try {
      const link = await this.waLinkService.generateWaLink(req.body);
      res.json({ success: true, data: link });
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }
}

module.exports = WaLinkController;