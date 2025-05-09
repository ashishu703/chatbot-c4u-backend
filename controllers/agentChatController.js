const ChatService = require("../services/chatService");

class AgentChatController {
  chatService;
  constructor() {
    this.chatService = new ChatService();
  }
   async getAgentChatsOwner(req, res) {
    try {
      const { uid } = req.body;
      const chats = await this.chatService.getAgentChatsOwner(req.decode.uid, uid);
      res.json({ data: chats, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getAssignedChatAgent(req, res) {
    try {
      const { chatId } = req.body;
      const agent = await this.chatService.getAssignedChatAgent(req.decode.uid, chatId);
      res.json({ data: agent, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async updateAgentInChat(req, res) {
    try {
      const { assignAgent, chatId } = req.body;
      await this.chatService.updateAgentInChat(req.decode.uid, assignAgent, chatId);
      res.json({ msg: "Updated", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async deleteAssignedChat(req, res) {
    try {
      const { uid, chat_id } = req.body;
      await this.chatService.deleteAssignedChat(req.decode.uid, uid, chat_id);
      res.json({ msg: "Chat was removed from the agent", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getMyAssignedChats(req, res) {
    try {
      const chats = await this.chatService.getMyAssignedChats(req.decode.uid, req.owner.uid);
      res.json({ data: chats, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getConversation(req, res) {
    try {
      const { chatId } = req.body;
      const data = await this.chatService.getConversation(req.owner.uid, chatId);
      res.json({ data, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async changeChatTicketStatus(req, res) {
    try {
      const { status, chatId } = req.body;
      if (!status || !chatId) {
        return res.json({ msg: "Invalid request" });
      }
      await this.chatService.changeChatTicketStatus(chatId, status);
      res.json({ success: true, msg: "Chat status updated" });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = AgentChatController;