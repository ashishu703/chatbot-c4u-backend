const ThemeService = require('../services/ThemeService');

class ThemeController {
  themeService;
  constructor() {
    this.themeService = new ThemeService();
  }
  async getTheme(req, res) {
    try {
      const result = await this.themeService.getTheme();
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }

  async saveTheme(req, res) {
    try {
      const result = await this.themeService.saveTheme(req.body.updatedJson);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }
}

module.exports = ThemeController;