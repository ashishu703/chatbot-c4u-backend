const WebConfigService = require('../services/WebConfigService');
const { formSuccess } = require('../utils/response.utils');

class WebConfigController {
  webConfigService;
  constructor() {
    this.webConfigService = new WebConfigService();
  }
  async updateWebConfig(req, res, next) {
    try {
      const result = await this.webConfigService .updateWebConfig(req);
      return formSuccess({ msg: 'Web config updated', data: result });
    } catch (err) {
      next(err);
    }
  }

  async getWebPublic(req, res, next) {
    try {
      const config = await this.webConfigService.getWebPublic();
      return formSuccess({ data: config });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WebConfigController;
