const ChatRepository = require("../repositories/ChatRepository");
const FacebookPageRepository = require("../repositories/FacebookPageRepository");
const MessangerChatService = require("../services/MessangerChatService");
const { formSuccess } = require("../utils/response.utils");

class MessengerChatController {

  constructor() {
    this.facebookPageRepository = new FacebookPageRepository();
  }
  async send(req, res, next) {
    try {
      const { text, chatId, toNumber } = req.body;
      const chat = await ChatRepository.findChatByChatId(chatId);
      const { recipient } = chat;
      const pageProfile = await this.facebookPageRepository.findByPageId(recipient);
      const chatService = new MessangerChatService(null, pageProfile.token);
      await chatService.initMeta();
      await chatService.send({
        text,
        toNumber,
      });
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }

  async sendImage(req, res, next) {
    try {
      const { chatId, toNumber, url } = req.body;
      const chat = await ChatRepository.findChatByChatId(chatId);
      const { recipient } = chat;
      const pageProfile = await this.facebookPageRepository.findByPageId(recipient);
      const chatService = new MessangerChatService(null, pageProfile.token);
      await chatService.initMeta();
      await chatService.sendImage({
        url,
        toNumber,
      });
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }
  async sendVideo(req, res, next) {
    try {
      const { chatId, toNumber, url } = req.body;
      const chat = await ChatRepository.findChatByChatId(chatId);
      const { recipient } = chat;
      const pageProfile = await this.facebookPageRepository.findByPageId(recipient);
      const chatService = new MessangerChatService(null, pageProfile.token);
      await chatService.initMeta();
      await chatService.sendVideo({
        url,
        toNumber,
      });
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }
  async sendDoc(req, res, next) {
    try {
      const { chatId, toNumber, url } = req.body;
      const chat = await ChatRepository.findChatByChatId(chatId);
      const { recipient } = chat;
      const pageProfile = await this.facebookPageRepository.findByPageId(recipient);
      const chatService = new MessangerChatService(null, pageProfile.token);
      await chatService.initMeta();
      await chatService.sendDoc({
        url,
        toNumber,
      });
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }
  async sendAudio(req, res, next) {
    try {
      const { chatId, toNumber, url } = req.body;
      const chat = await ChatRepository.findChatByChatId(chatId);
      const { recipient } = chat;
      const pageProfile = await this.facebookPageRepository.findByPageId(recipient);
      const chatService = new MessangerChatService(null, pageProfile.token);
      await chatService.initMeta();
      await chatService.sendAudio({
        url,
        toNumber,
      });
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }
};


module.exports = MessengerChatController;