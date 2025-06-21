const WhatsappMessageChangeDto = require("../dtos/Whatsapp/WhatsappMessageChangeDto");
const ChatRepository = require("../repositories/ChatRepository");
const WhatsappChatService = require("../services/WhatsappChatService");
const { TEXT } = require("../types/message.types");
const { formSuccess } = require("../utils/response.utils");


class WhatsappChatController {
    constructor() {
        this.whatsappChatService = new WhatsappChatService();
        this.chatRepository = new ChatRepository();
    }
    // async sendTemplate(req, res, next) {
    //     try {
    //         const { content, toName, senderId, chatId, msgType } = req.body;
    //         const user = req.decode;
    //         if (!content || !toName || !senderId || !msgType) {
    //             throw new InvalidRequestException();
    //         }
    //         const result = await this.inboxService.sendMessage(user.uid, {
    //             content,
    //             toName,
    //             senderId,
    //             chatId,
    //             msgType,
    //             type: "template",
    //         });
    //         return formSuccess(res, result);
    //     } catch (err) {
    //         next(err);
    //     }
    // }

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

            const result = await (new WhatsappChatService(null, chat.account.token)).send(
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

    // async sendMetaTemplate(req, res, next) {
    //     try {
    //         const { template, senderId, toName, chatId, example } = req.body;
    //         const user = req.decode;
    //         if (!template) {
    //             throw new ProvideTemplateException();
    //         }
    //         await this.inboxService.sendMetaTemplate(user.uid, {
    //             template,
    //             senderId,
    //             toName,
    //             chatId,
    //             example,
    //         });
    //         return formSuccess(res, { msg: __t(template_message_sent) });
    //     } catch (err) {
    //         next(err);
    //     }
    // }


}

module.exports = WhatsappChatController