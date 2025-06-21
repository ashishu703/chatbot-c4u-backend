const ChatRepository = require("../repositories/ChatRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const MessangerChatService = require("../services/MessangerChatService");
const { formSuccess } = require("../utils/response.utils");

class MessengerChatController {

  constructor() {
    this.facebookPageRepository = new FacebookPageRepository();
    this.chatRepository = new ChatRepository();
  }
  async send(req, res, next) {
    try {
      const { text, chatId, senderId } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["page"]);

      const chatService = new MessangerChatService(null, chat.page.token);

      await chatService.send({
        text,
        senderId,
      });

      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }

  async sendImage(req, res, next) {
    try {
      const { chatId, senderId, url } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["page"]);

      const chatService = new MessangerChatService(null, chat.page.token);

      await chatService.sendImage({
        url,
        senderId,
      });
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }
  async sendVideo(req, res, next) {
    try {
      const { chatId, senderId, url } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["page"]);

      const chatService = new MessangerChatService(null, chat.page.token);

      await chatService.sendVideo({
        url,
        senderId,
      });
    } catch (err) {
      next(err);
    }
  }
  async sendDoc(req, res, next) {
    try {
      const { chatId, senderId, url } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["page"]);

      const chatService = new MessangerChatService(null, chat.page.token);

      await chatService.sendDoc({
        url,
        senderId,
      });
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }
  async sendAudio(req, res, next) {
    try {
      const { chatId, senderId, url } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["page"]);

      const chatService = new MessangerChatService(null, chat.page.token);

      await chatService.sendAudio({
        url,
        senderId,
      });
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }
};


module.exports = MessengerChatController;