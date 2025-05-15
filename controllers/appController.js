const AppService = require('../services/AppService');
const { appVersion, addON } = require('../env');
const {formSuccess} = require("../utils/response.utils");
class AppController {
   appService;
   constructor() {
    this.appService = new AppService();
  }
  async returnModule(req, res, next) {
    try {
      return formSuccess({ data: addON || [] });
    } catch (err) {
      next(err);
    }
  }

  async checkInstall(req, res, next) {
    try {
      const installed = await this.appService.checkInstall();
      return formSuccess({ success: installed });
    } catch (err) {
      next(err);
    }
  }

  async getAppVersion(req, res, next) {
    try {
      return formSuccess({ version: appVersion });
    } catch (err) {
      next(err);
    }
  }

  async installApp(req, res, next) {
    try {
      const result = await this.appService.installApp(req.files);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async updateApp(req, res, next) {
    try {
      const result = await this.appService.updateApp(req.body, req.files);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async updateToBeShown(req, res, next) {
    try {
      return formSuccess({ show: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AppController;