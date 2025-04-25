const ChatbotService = require("../services/chatbotService");

class ChatbotController {
  static async addChatbot(req, res) {
    try {
      const { title, chats, flow, for_all } = req.body;
      const user = req.decode;

      if (!title || !chats?.length || !flow) {
        return res.json({
          success: false,
          msg: "Please provide all fields! title, chats, flow are required",
        });
      }

      const result = await ChatbotService.addChatbot({
        title,
        chats,
        flow,
        for_all,
        user,
      });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async updateChatbot(req, res) {
    try {
      const { title, chats, flow, for_all, id } = req.body;
      const user = req.decode;

      if (!title || !chats?.length || !flow) {
        return res.json({
          success: false,
          msg: "Please provide all fields! title, chats, flow are required",
        });
      }

      const result = await ChatbotService.updateChatbot({
        id,
        title,
        chats,
        flow,
        for_all,
        user,
      });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getChatbots(req, res) {
    try {
      const user = req.decode;
      const chatbots = await ChatbotService.getChatbots(user.uid);
      res.json({ data: chatbots, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async changeBotStatus(req, res) {
    try {
      const { id, status } = req.body;
      const user = req.decode;

      const result = await ChatbotService.changeBotStatus(id, status, user);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async deleteChatbot(req, res) {
    try {
      const { id } = req.body;
      const user = req.decode;

      const result = await ChatbotService.deleteChatbot(id, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async makeRequestApi(req, res) {
    try {
      const { url, body, headers, type } = req.body;

      if (!url || !type) {
        return res.json({ success: false, msg: "Url and type are required" });
      }

      const result = await ChatbotService.makeRequestApi({ url, body, headers, type });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = ChatbotController;