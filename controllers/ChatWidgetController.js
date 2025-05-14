const ChatWidgetService = require("../services/chatWidgetService");

class ChatWidgetController {
    chatWidgetService;
  constructor() {
    this.chatWidgetService = new ChatWidgetService();
  }

  async addWidget(req, res, next) {
    try {
      const result = await this.chatWidgetService.addWidget(req);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
  async getMyWidgets(req, res, next) {
    try {
      const result = await this.chatWidgetService.getMyWidgets(req.decode.uid);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }

  async deleteWidget(req, res, next) {
    try {
      const { id } = req.body;
      const result = await this.chatWidgetService.deleteWidget(id);
      res.json(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatWidgetController;
