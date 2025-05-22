const WidgetService = require('../services/widgetService');
const { formSuccess } = require('../utils/response.utils');

class WidgetController {
  widgetService;
  constructor() {
    this.widgetService = new WidgetService();
  }
  async returnMediaUrl(req, res, next) {
    try {
      const result = await this.widgetService.returnMediaUrl(req.files);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async addWidget(req, res, next) {
    try {
      const { title, whatsapp_number, place, selectedIcon, logoType, size } = req.body;
      const result = await this.widgetService.addWidget(req.decode.uid, {
        title,
        whatsapp_number,
        place,
        selectedIcon,
        logoType,
        size
      }, req.files);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async getMyWidget(req, res, next) {
    try {
      const result = await this.widgetService.getMyWidget(req.decode.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteWidget(req, res, next) {
    try {
      const { id } = req.body;
      const result = await this.widgetService.deleteWidget(id);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async getWidget(req, res, next) {
    try {
      const { id } = req.query;
      const result = await this.widgetService.getWidget(id);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = WidgetController;