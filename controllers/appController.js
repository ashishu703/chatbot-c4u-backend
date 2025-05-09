const AppService = require('../services/AppService');
const { appVersion, addON } = require('../env');

class AppController {
   appService;
   constructor() {
    this.appService = new AppService();
  }
  async returnModule(req, res) {
    try {
      res.json({ success: true, data: addON || [] });
    } catch (error) {
      res.json({ err: error.message, msg: 'server error' });
      console.log(error);
    }
  }

  async checkInstall(req, res) {
    try {
      const installed = await this.appService.checkInstall();
      res.json({ success: installed });
    } catch (error) {
      res.json({ success: false, msg: 'Server error' });
      console.log(error);
    }
  }

  async getAppVersion(req, res) {
    try {
      res.json({ success: true, version: appVersion });
    } catch (error) {
      res.json({ success: false, msg: 'Server error' });
      console.log(error);
    }
  }

  async installApp(req, res) {
    try {
      const result = await this.appService.installApp(req.files);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Server error' });
      console.log(error);
    }
  }

  async updateApp(req, res) {
    try {
      const result = await this.appService.updateApp(req.body, req.files);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }

  async updateToBeShown(req, res) {
    try {
      res.json({ success: true, show: true });
    } catch (error) {
      res.json({ success: false, msg: 'Server error' });
      console.log(error);
    }
  }
}

module.exports = AppController;