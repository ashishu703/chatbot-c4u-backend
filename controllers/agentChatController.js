const ChatService = require("../services/chatService");

class AgentChatController {
  static async getAgentChatsOwner(req, res) {
    try {
      const { uid } = req.body;
      const chats = await ChatService.getAgentChatsOwner(req.decode.uid, uid);
      res.json({ data: chats, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getAssignedChatAgent(req, res) {
    try {
      const { chatId } = req.body;
      const agent = await ChatService.getAssignedChatAgent(req.decode.uid, chatId);
      res.json({ data: agent, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async updateAgentInChat(req, res) {
    try {
      const { assignAgent, chatId } = req.body;
      await ChatService.updateAgentInChat(req.decode.uid, assignAgent, chatId);
      res.json({ msg: "Updated", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async deleteAssignedChat(req, res) {
    try {
      const { uid, chat_id } = req.body;
      await ChatService.deleteAssignedChat(req.decode.uid, uid, chat_id);
      res.json({ msg: "Chat was removed from the agent", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getMyAssignedChats(req, res) {
    try {
      const chats = await ChatService.getMyAssignedChats(req.decode.uid, req.owner.uid);
      res.json({ data: chats, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getConversation(req, res) {
    try {
      const { chatId } = req.body;
      const data = await ChatService.getConversation(req.owner.uid, chatId);
      res.json({ data, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async changeChatTicketStatus(req, res) {
    try {
      const { status, chatId } = req.body;
      if (!status || !chatId) {
        return res.json({ msg: "Invalid request" });
      }
      await ChatService.changeChatTicketStatus(chatId, status);
      res.json({ success: true, msg: "Chat status updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = AgentChatController;