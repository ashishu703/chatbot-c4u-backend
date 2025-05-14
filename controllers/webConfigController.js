const WebConfigService = require('../services/WebConfigService');

class WebConfigController {
  webConfigService;
  constructor() {
    this.webConfigService = new WebConfigService();
  }
  async updateWebConfig(req, res, next) {
    try {
      const result = await this.webConfigService .updateWebConfig(req);
      res.json({ success: true, msg: 'Web config updated', data: result });
    } catch (err) {
      next(err);
    }
  }

  async getWebPublic(req, res, next) {
    try {
      const config = await this.webConfigService.getWebPublic();
      res.json({ success: true, data: config });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WebConfigController;
