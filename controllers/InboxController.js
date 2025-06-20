const InboxService = require("../services/InboxService");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const NotEnoughInputProvidedException = require("../exceptions/CustomExceptions/NotEnoughInputProvidedException");
const ProvideTemplateException = require("../exceptions/CustomExceptions/ProvideTemplateException");
const { formSuccess } = require("../utils/response.utils");
const { formRawResponse } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");

class InboxController {
  inboxService;
  constructor() {
    this.inboxService = new InboxService();
  }


  async getChats(req, res, next) {
    try {
      const user = req.decode;
      const query = req.query;
      const chats = await this.inboxService.getChats(user.uid, query);
      return formSuccess(res, { data: chats });
    } catch (err) {
      next(err);
    }
  }

  async getConversation(req, res, next) {
    try {
      const { chatId } = req.body;
      const query = req.query;
      const user = req.decode;
      const conversation = await this.inboxService.getConversation(user.uid, chatId, query);
      return formSuccess(res, { data: conversation });
    } catch (err) {
      next(err);
    }
  }



  async testSocket(req, res, next) {
    try {
      const { msg } = req.query;
      await this.inboxService.testSocket();
      return formSuccess(res, { msg: __t("socket_event_emitted") });
    } catch (err) {
      next(err);
    }
  }


  async deleteChat(req, res, next) {
    try {
      const { chatId } = req.body;
      const user = req.decode;
      await this.inboxService.deleteChat(user.uid, chatId);
      return formSuccess(res, { msg: __t("conversation_deleted") });
    } catch (err) {
      next(err);
    }
  }

}

module.exports = InboxController;