const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const UrlAndTypeRequiredException = require("../exceptions/CustomExceptions/UrlAndTypeRequiredException");
const ChatbotService = require("../services/ChatbotService");
const { __t } = require("../utils/locale.utils");
const { formSuccess } = require("../utils/response.utils");
class ChatbotController {
  chatbotService;
  constructor() {
    this.chatbotService = new ChatbotService();
  }
  async addChatbot(req, res, next) {
    try {
      const { title, chats, flow_id, for_all } = req.body;
      const { uid } = req.decode;

      if (!title || !chats?.length || !flow_id) {
        throw new FillAllFieldsException();
      }

      await this.chatbotService.addChatbot({
        title,
        chats,
        flow_id,
        for_all,
        uid,
      });

      return formSuccess(res, { msg: __t("chatbot_added") });
    } catch (err) {
      next(err);
    }
  }


  async updateChatbot(req, res, next) {
    try {
      const { title, chats, flow_id, for_all, id } = req.body;
      const { uid } = req.decode;

      if (!title || !chats?.length || !flow_id) {
        throw new FillAllFieldsException();
      }

      await this.chatbotService.updateChatbot(id, {
        title,
        chats,
        flow_id,
        for_all,
        uid,
      });

      return formSuccess(res, { msg: __t("Chatbot was updated") });
    } catch (err) {
      next(err);
    }
  }



  async getChatbots(req, res, next) {
    try {
      const query = req.query;
      const user = req.decode;
      const chatbots = await this.chatbotService.getChatbots({
        where: { uid: user.uid },
        include: ["flow", "chatbotChats"],
        ...query,
      });
      return formSuccess(res, { ...chatbots });
    } catch (err) {
      next(err);
    }
  }

  async changeBotStatus(req, res, next) {
    try {
      const { id, status } = req.body;
      const {uid} = req.decode;

      await this.chatbotService.changeBotStatus({id, status, uid});
      return formSuccess(res, { msg: __t("Chatbot was updated") });
    } catch (err) {
      next(err);
    }
  }

  async deleteChatbot(req, res, next) {
    try {
      const { id } = req.body;
      const user = req.decode;

      await this.chatbotService.deleteChatbot(id, user.uid);
      return formSuccess(res, { msg: __t("chatbot_deleted") });
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
      return formSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = ChatbotController;