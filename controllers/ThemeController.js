const ThemeService = require('../services/ThemeService');
const { formSuccess } = require('../utils/response.utils');

class ThemeController {
  themeService;
  constructor() {
    this.themeService = new ThemeService();
  }
  async getTheme(req, res, next) {
    try {
      const result = await this.themeService.getTheme();
      return formSuccess(res,result);
    } catch (err) {
      next(err);
    }
  }

  async saveTheme(req, res, next) {
    try {
     await this.themeService.saveTheme(req.body.updatedJson);
      return formSuccess(res,{msg : __t("theme_updated")});
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ThemeController;