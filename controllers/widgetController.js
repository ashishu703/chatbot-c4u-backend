const widgetService = require('../services/widgetService');

class WidgetController {
  async returnMediaUrl(req, res) {
    try {
      const result = await widgetService.returnMediaUrl(req.files);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async addWidget(req, res) {
    try {
      const { title, whatsapp_number, place, selectedIcon, logoType, size } = req.body;
      const result = await widgetService.addWidget(req.decode.uid, {
        title,
        whatsapp_number,
        place,
        selectedIcon,
        logoType,
        size
      }, req.files);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async getMyWidget(req, res) {
    try {
      const result = await widgetService.getMyWidget(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async deleteWidget(req, res) {
    try {
      const { id } = req.body;
      const result = await widgetService.deleteWidget(id);
      res.json(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }

  async getWidget(req, res) {
    try {
      const { id } = req.query;
      const result = await widgetService.getWidget(id);
      res.send(result);
    } catch (error) {
      res.json({ success: false, msg: 'Something went wrong', err: error.message });
      console.log(error);
    }
  }
}

module.exports = new WidgetController();