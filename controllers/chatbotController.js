const FillAllFieldsException = require("../exceptions/CustomExceptions/FIllAllFieldsException");
const UrlAndTypeRequiredException = require("../exceptions/CustomExceptions/UrlAndTypeRequiredException");
const ChatbotService = require("../services/chatbotService");
const {formSuccess} = require("../utils/response.utils");
class ChatbotController {
  chatbotService;
  constructor() {
    this.chatbotService = new ChatbotService();
  }
   async addChatbot(req, res, next) {
    try {
      const { title, chats, flow, for_all } = req.body;
      const user = req.decode;

      if (!title || !chats?.length || !flow) {
        throw new FillAllFieldsException();
      }

      const result = await this.chatbotService.addChatbot({
        title,
        chats,
        flow,
        for_all,
        user,
      });
     return formSuccess(result);
    } catch (err) {
     next(err);
    }
  }

   async updateChatbot(req, res, next) {
    try {
      const { title, chats, flow, for_all, id } = req.body;
      const user = req.decode;

      if (!title || !chats?.length || !flow) {
        throw new FillAllFieldsException();
      }

      const result = await this.chatbotService.updateChatbot({
        id,
        title,
        chats,
        flow,
        for_all,
        user,
      });
     return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async getChatbots(req, res, next) {
    try {
      const user = req.decode;
      const chatbots = await this.chatbotService.getChatbots(user.uid);
     return formSuccess({ data: chatbots });
    } catch (err) {
      next(err);
    }
  }

   async changeBotStatus(req, res, next) {
    try {
      const { id, status } = req.body;
      const user = req.decode;

      const result = await this.chatbotService.changeBotStatus(id, status, user);
     return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }

   async deleteChatbot(req, res, next) {
    try {
      const { id } = req.body;
      const user = req.decode;

      const result = await this.chatbotService.deleteChatbot(id, user.uid);
     return formSuccess(result);
    } catch (err) {
     next(err);
    }
  }

   async makeRequestApi(req, res, next) {
    try {
      const { url, body, headers, type } = req.body;

      if (!url || !type) {
        throw new UrlAndTypeRequiredException();
      }

      const result = await this.chatbotService.makeRequestApi({ url, body, headers, type });
     return formSuccess(result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatbotController;