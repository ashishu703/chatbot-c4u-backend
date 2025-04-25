const waLinkService = require('../services/waLinkService');

class WaLinkController {
  async generateWaLink(req, res) {
    try {
      const link = await waLinkService.generateWaLink(req.body);
      res.json({ success: true, data: link });
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }
}

module.exports = new WaLinkController();