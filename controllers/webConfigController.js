const webConfigService = require('../services/webConfigService');

class WebConfigController {
  async updateWebConfig(req, res) {
    try {
      const result = await webConfigService.updateWebConfig(req);
      res.json({ success: true, msg: 'Web config updated', data: result });
    } catch (error) {
      console.error('Update error:', error);
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async getWebPublic(req, res) {
    try {
      const config = await webConfigService.getWebPublic();
      res.json({ success: true, data: config });
    } catch (error) {
      console.error('Fetch error:', error);
      res.status(500).json({ success: false, msg: error.message });
    }
  }
}

module.exports = new WebConfigController();
