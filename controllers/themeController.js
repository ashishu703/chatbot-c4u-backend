const themeService = require('../services/themeService');

class ThemeController {
  async getTheme(req, res) {
    try {
      const result = await themeService.getTheme();
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }

  async saveTheme(req, res) {
    try {
      const result = await themeService.saveTheme(req.body.updatedJson);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: error.message });
      console.log(error);
    }
  }
}

module.exports = new ThemeController();