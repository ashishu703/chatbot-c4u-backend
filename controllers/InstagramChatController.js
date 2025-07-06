const ChatRepository = require("../repositories/ChatRepository");
const InstagramChatService = require("../services/InstagramChatService");
const { IMAGE, VIDEO, FILE, AUDIO } = require("../types/message.types");
const { __t } = require("../utils/locale.utils");
const { formSuccess } = require("../utils/response.utils");

class InstagramChatController {

  constructor() {
    this.chatRepository = new ChatRepository();
  }

  async send(req, res, next) {
    try {
      const { text, chatId, senderId } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["account"]);

      const chatService = new InstagramChatService(null, chat.account.token);

      await chatService.send({
        text,
        senderId,
      });

      return formSuccess(res, { msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }

  async sendImage(req, res, next) {
    try {
      const { url, chatId, senderId } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["account"]);

      const chatService = new InstagramChatService(null, chat.account.token);

      await chatService.sendAttachment(url, IMAGE, senderId);

      return formSuccess(res, { msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }
  async sendVideo(req, res, next) {
    try {
      const { url, chatId, senderId } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["account"]);

      const chatService = new InstagramChatService(null, chat.account.token);

      await chatService.sendAttachment(url, VIDEO, senderId);

      return formSuccess(res, { msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }
  async sendDoc(req, res, next) {
    try {
      const { url, chatId, senderId } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["account"]);

      const chatService = new InstagramChatService(null, chat.account.token);

      await chatService.sendAttachment(url, FILE, senderId);

      return formSuccess(res, { msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }
  async sendAudio(req, res, next) {
    try {
      const { url, chatId, senderId } = req.body;

      const chat = await this.chatRepository.findByChatId(chatId, ["account"]);

      const chatService = new InstagramChatService(null, chat.account.token);

      await chatService.sendAttachment(url, AUDIO, senderId);

      return formSuccess(res, { msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }
};
module.exports = InstagramChatController