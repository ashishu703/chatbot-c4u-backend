const TypeTagException = require("../exceptions/CustomExceptions/TypeTagException");
const ChatService = require("../services/chatService");

class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  async saveNote(req, res, next) {
    try {
      const { chatId, note } = req.body;
      await this.chatService.saveNote(chatId, note);
      res.json({ success: true, msg: "Notes were updated" });
    } catch (err) {
      next(err);
    }
  }

  async pushTag(req, res, next) {
    try {
      const { chatId, tag } = req.body;

      if (!tag) {
       throw new TypeTagException();
      }

      await this.chatService.pushTag(chatId, tag);
      res.json({ success: true, msg: "Tag was added" });
    } catch (err) {
      next(err);
    }
  }

  async deleteTag(req, res, next) {
    try {
      const { chatId, tag } = req.body;
      await this.chatService.deleteTag(chatId, tag);
      res.json({ success: true, msg: "Tag was deleted" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatController;
