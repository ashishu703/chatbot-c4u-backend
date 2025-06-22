const WebConfigService = require('../services/WebConfigService');
const { formSuccess } = require('../utils/response.utils');
const { __t }= require("../utils/locale.utils")
class WebConfigController {
  webConfigService;
  constructor() {
    this.webConfigService = new WebConfigService();
  }
  async updateWebConfig(req, res, next) {
    try {
      const result = await this.webConfigService .updateWebConfig(req);
      return formSuccess(res,{ msg: __t("web_config_updated"), result });
    } catch (err) {
      next(err);
    }
  }

  async getWebPublic(req, res, next) {
    try {
      const config = await this.webConfigService.getWebPublic();
      return formSuccess(res,{ data: config });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WebConfigController;
