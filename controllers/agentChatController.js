const ChatService = require("../services/chatService");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
class AgentChatController {
  chatService;
  constructor() {
    this.chatService = new ChatService();
  }
   async getAgentChatsOwner(req, res, next) {
    try {
      const { uid } = req.body;
      const chats = await this.chatService.getAgentChatsOwner(req.decode.uid, uid);
      res.json({ data: chats, success: true });
    } catch (err) {
     next(err);
    }
  }

   async getAssignedChatAgent(req, res, next) {
    try {
      const { chatId } = req.body;
      const agent = await this.chatService.getAssignedChatAgent(req.decode.uid, chatId);
      res.json({ data: agent, success: true });
    } catch (err) {
      next(err);
    }
  }

   async updateAgentInChat(req, res, next) {
    try {
      const { assignAgent, chatId } = req.body;
      await this.chatService.updateAgentInChat(req.decode.uid, assignAgent, chatId);
      res.json({ msg: "Updated", success: true });
    } catch (err) {
      next(err);
    }
  }

   async deleteAssignedChat(req, res, next) {
    try {
      const { uid, chat_id } = req.body;
      await this.chatService.deleteAssignedChat(req.decode.uid, uid, chat_id);
       res.json({ msg: "Chat was removed from the agent", success: true });
    } catch (err) {
     next(err);
    }
  }

   async getMyAssignedChats(req, res, next) {
    try {
      const chats = await this.chatService.getMyAssignedChats(req.decode.uid, req.owner.uid);
      res.json({ data: chats, success: true });
    } catch (err) {
     next(err);
    }
  }

   async getConversation(req, res, next) {
    try {
      const { chatId } = req.body;
      const data = await this.chatService.getConversation(req.owner.uid, chatId);
      res.json({ data, success: true });
    } catch (err) {
     next(err);
    }
  }

   async changeChatTicketStatus(req, res, next) {
    try {
      const { status, chatId } = req.body;
      if (!status || !chatId) {
        throw new InvalidRequestException();
      }
      await this.chatService.changeChatTicketStatus(chatId, status);
       res.json({ success: true, msg: "Chat status updated" });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AgentChatController;