const WaLinkService = require('../services/WaLinkService');
const { formSuccess } = require('../utils/response.utils');

class WaLinkController {
  waLinkService;
  constructor() {
    this.waLinkService = new WaLinkService();
  }
  async generateWaLink(req, res, next) {
    try {
      const link = await this.waLinkService.generateWaLink(req.body);
      return formSuccess({ data: link });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WaLinkController;