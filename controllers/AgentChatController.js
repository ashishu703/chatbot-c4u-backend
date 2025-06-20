const ChatService = require("../services/chatService");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
class AgentChatController {
  chatService;
  constructor() {
    this.chatService = new ChatService();
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