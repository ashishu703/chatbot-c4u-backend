const ChatService = require("../services/chatService");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
class AgentChatController {
  chatService;
  constructor() {
    this.chatService = new ChatService();
  }
  async getAgentChatsOwner(req, res, next) {
    try {
      const { uid } = req.body;
      const chats = await this.chatService.getAgentChatsOwner(req.decode.uid, uid);
      return formSuccess(res,{ data: chats });
    } catch (err) {
      next(err);
    }
  }

  async getAssignedChatAgent(req, res, next) {
    try {
      const { chatId } = req.body;
      const agent = await this.chatService.getAssignedChatAgent(req.decode.uid, chatId);
      return formSuccess(res,{ data: agent });
    } catch (err) {
      next(err);
    }
  }

  async updateAgentInChat(req, res, next) {
    try {
      const { assignAgent, chatId } = req.body;
      await this.chatService.updateAgentInChat(req.decode.uid, assignAgent, chatId);
      return formSuccess(res,{
        msg: __t("updated"),
      });
    } catch (err) {
      next(err);
    }
  }

  async deleteAssignedChat(req, res, next) {
    try {
      const { uid, chat_id } = req.body;
      await this.chatService.deleteAssignedChat(req.decode.uid, uid, chat_id);
      return formSuccess(res,{
        msg: __t(
          "chat_removed_from_agent"
        ),
      });
    } catch (err) {
      next(err);
    }
  }

  async getMyAssignedChats(req, res, next) {
    try {
      const chats = await this.chatService.getMyAssignedChats(req.decode.uid, req.owner.uid);
      return formSuccess(res,{ data: chats });
    } catch (err) {
      next(err);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { chatId } = req.body;
      const data = await this.chatService.getConversation(req.owner.uid, chatId);
      return formSuccess(res,{ data });
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
      return formSuccess(res,{ msg: __t("chat_status_updated"), });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AgentChatController;