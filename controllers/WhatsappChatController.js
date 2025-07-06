const ChatRepository = require("../repositories/ChatRepository");
const WhatsappChatService = require("../services/WhatsappChatService");
const { formSuccess } = require("../utils/response.utils");


class WhatsappChatController {
    constructor() {
        this.whatsappChatService = new WhatsappChatService();
        this.chatRepository = new ChatRepository();
    }


    async sendImage(req, res, next) {
        try {
            const { url, senderId, chatId, caption } = req.body;

            const chat = await this.chatRepository.findByChatId(chatId, [
                "account",
            ]);

            const result = await (new WhatsappChatService(null, chat.account.token)).sendImage(
                chat,
                {
                    wabaId: chat.account.social_user_id,
                    senderId,
                    url,
                    text: caption
                });



            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendVideo(req, res, next) {
        try {
            const { url, senderId, chatId, caption } = req.body;

            const chat = await this.chatRepository.findByChatId(chatId, [
                "account",
            ]);

            const result = await (new WhatsappChatService(null, chat.account.token)).sendVideo(
                chat,
                {
                    wabaId: chat.account.social_user_id,
                    senderId,
                    url,
                    text: caption
                });



            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendDocument(req, res, next) {
        try {
            const { url, senderId, chatId, caption } = req.body;

            const chat = await this.chatRepository.findByChatId(chatId, [
                "account",
            ]);

            const result = await (new WhatsappChatService(null, chat.account.token)).sendDoc(
                chat,
                {
                    wabaId: chat.account.social_user_id,
                    senderId,
                    url,
                    text: caption
                });



            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendAudio(req, res, next) {
        try {
            const { url, senderId, chatId } = req.body;

            const chat = await this.chatRepository.findByChatId(chatId, [
                "account",
            ]);

            const result = await (new WhatsappChatService(null, chat.account.token)).sendAudio(
                chat,
                {
                    wabaId: chat.account.social_user_id,
                    senderId,
                    url
                });



            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendText(req, res, next) {
        try {
            const { text, senderId, chatId } = req.body;

            const chat = await this.chatRepository.findByChatId(chatId, [
                "account",
            ]);

            const result = await (new WhatsappChatService(null, chat.account.token)).sendText(
                chat,
                {
                    wabaId: chat.account.social_user_id,
                    senderId,
                    text
                });



            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }


}

module.exports = WhatsappChatController