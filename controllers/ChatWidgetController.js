const ChatWidgetService = require("../services/chatWidgetService");
const {formSuccess} = require("../utils/response.utils");
class ChatWidgetController {
    chatWidgetService;
  constructor() {
    this.chatWidgetService = new ChatWidgetService();
  }

  async addWidget(req, res, next) {
    try {
      const result = await this.chatWidgetService.addWidget(req);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
  async getMyWidgets(req, res, next) {
    try {
      const result = await this.chatWidgetService.getMyWidgets(req.decode.uid);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteWidget(req, res, next) {
    try {
      const { id } = req.body;
      const result = await this.chatWidgetService.deleteWidget(id);
      return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatWidgetController;
