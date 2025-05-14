const ThemeService = require('../services/ThemeService');

class ThemeController {
  themeService;
  constructor() {
    this.themeService = new ThemeService();
  }
  async getTheme(req, res, next) {
    try {
      const result = await this.themeService.getTheme();
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async saveTheme(req, res, next) {
    try {
      const result = await this.themeService.saveTheme(req.body.updatedJson);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ThemeController;