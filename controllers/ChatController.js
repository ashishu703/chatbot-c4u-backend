const ChatService = require("../services/chatService");

class ChatController {
  constructor() {
    this.chatService = new ChatService();
  }

  async saveNote(req, res) {
    try {
      const { chatId, note } = req.body;
      await this.chatService.saveNote(chatId, note);
      res.json({ success: true, msg: "Notes were updated" });
    } catch (err) {
      console.log(err);
      res.json({ success: false, msg: "something went wrong", err });
    }
  }

  async pushTag(req, res) {
    try {
      const { chatId, tag } = req.body;

      if (!tag) {
        return res.json({ success: false, msg: "Please type a tag" });
      }

      await this.chatService.pushTag(chatId, tag);
      res.json({ success: true, msg: "Tag was added" });
    } catch (err) {
      console.log(err);
      res.json({ success: false, msg: "something went wrong", err });
    }
  }

  async deleteTag(req, res) {
    try {
      const { chatId, tag } = req.body;
      await this.chatService.deleteTag(chatId, tag);
      res.json({ success: true, msg: "Tag was deleted" });
    } catch (err) {
      console.log(err);
      res.json({ success: false, msg: "something went wrong", err });
    }
  }
}

module.exports = ChatController;
