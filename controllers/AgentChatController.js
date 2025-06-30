const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
const InboxService = require("../services/InboxService");
class AgentChatController {
  inboxService;
  constructor() {
    this.inboxService = new InboxService();
  }

  async getMyAssignedChats(req, res, next) {
    try {
      const { uid: agentId } = req.decode;
      const { uid: ownerId } = req.owner;
      const chats = await this.inboxService.getAgentAssignedChats(agentId, ownerId);
      return formSuccess(res, { data: chats });
    } catch (err) {
      next(err);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { chatId } = req.body;
      const { uid } = req.owner;
      const data = await this.inboxService.getConversation(uid, chatId);
      return formSuccess(res, data);
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
      await this.inboxService.changeChatTicketStatus(chatId, status);
      return formSuccess(res, { msg: __t("chat_status_updated"), });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AgentChatController;