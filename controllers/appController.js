const AppService = require('../services/AppService');
const { appVersion, addON } = require('../env');

class AppController {
   appService;
   constructor() {
    this.appService = new AppService();
  }
  async returnModule(req, res, next) {
    try {
      res.json({ success: true, data: addON || [] });
    } catch (err) {
      next(err);
    }
  }

  async checkInstall(req, res, next) {
    try {
      const installed = await this.appService.checkInstall();
      res.json({ success: installed });
    } catch (err) {
      next(err);
    }
  }

  async getAppVersion(req, res, next) {
    try {
      res.json({ success: true, version: appVersion });
    } catch (err) {
      next(err);
    }
  }

  async installApp(req, res, next) {
    try {
      const result = await this.appService.installApp(req.files);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateApp(req, res, next) {
    try {
      const result = await this.appService.updateApp(req.body, req.files);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async updateToBeShown(req, res, next) {
    try {
      res.json({ success: true, show: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AppController;