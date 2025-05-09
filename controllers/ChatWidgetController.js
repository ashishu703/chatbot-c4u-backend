const ChatWidgetService = require("../services/chatWidgetService");

class ChatWidgetController {
    chatWidgetService;
  constructor() {
    this.chatWidgetService = new ChatWidgetService();
  }

  async addWidget(req, res) {
    try {
      const result = await this.chatWidgetService.addWidget(req);
      res.json(result);
    } catch (error) {
      console.error(error);
      res.status(500).json({ success: false, msg: error.message });
    }
  }
  async getMyWidgets(req, res) {
    try {
      const result = await this.chatWidgetService.getMyWidgets(req.decode.uid);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }

  async deleteWidget(req, res) {
    try {
      const { id } = req.body;
      const result = await this.chatWidgetService.deleteWidget(id);
      res.json(result);
    } catch (error) {
      res.status(500).json({ success: false, msg: error.message });
    }
  }
}

module.exports = ChatWidgetController;
