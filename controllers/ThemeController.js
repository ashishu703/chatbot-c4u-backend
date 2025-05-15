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
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async saveTheme(req, res, next) {
    try {
      const result = await this.themeService.saveTheme(req.body.updatedJson);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ThemeController;