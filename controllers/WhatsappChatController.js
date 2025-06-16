const WhatsappChatService = require("../services/WhatsappChatService");


class WhatsappChatController {
    constructor () {
        this.whatsappChatService = new WhatsappChatService();
    }
    async sendTemplate(req, res, next) {
        try {
            const { content, toName, toNumber, chatId, msgType } = req.body;
            const user = req.decode;
            if (!content || !toName || !toNumber || !msgType) {
                throw new InvalidRequestException();
            }
            const result = await this.inboxService.sendMessage(user.uid, {
                content,
                toName,
                toNumber,
                chatId,
                msgType,
                type: "template",
            });
            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendImage(req, res, next) {
        try {
            const { url, toNumber, toName, chatId, caption } = req.body;
            const user = req.decode;
            if (!url || !toNumber || !toName || !chatId) {
                throw new NotEnoughInputProvidedException();
            }
            const result = await this.inboxService.sendMessage(user.uid, {
                url,
                toNumber,
                toName,
                chatId,
                caption,
                type: "image",
            });
            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendVideo(req, res, next) {
        try {
            const { url, toNumber, toName, chatId, caption } = req.body;
            const user = req.decode;
            if (!url || !toNumber || !toName || !chatId) {
                throw new NotEnoughInputProvidedException();
            }
            const result = await this.inboxService.sendMessage(user.uid, {
                url,
                toNumber,
                toName,
                chatId,
                caption,
                type: "video",
            });
            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendDocument(req, res, next) {
        try {
            const { url, toNumber, toName, chatId, caption } = req.body;
            const user = req.decode;
            if (!url || !toNumber || !toName || !chatId) {
                throw new NotEnoughInputProvidedException();
            }
            const result = await this.inboxService.sendMessage(user.uid, {
                url,
                toNumber,
                toName,
                chatId,
                caption,
                type: "document",
            });
            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendAudio(req, res, next) {
        try {
            const { url, toNumber, toName, chatId } = req.body;
            const user = req.decode;
            if (!url || !toNumber || !toName || !chatId) {
                throw new NotEnoughInputProvidedException();
            }
            const result = await this.inboxService.sendMessage(user.uid, {
                url,
                toNumber,
                toName,
                chatId,
                type: "audio",
            });
            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendText(req, res, next) {
        try {
            const { text, toNumber, toName, chatId } = req.body;
            const user = req.decode;
            if (!text || !toNumber || !toName || !chatId) {
                throw new NotEnoughInputProvidedException();
            }
            const result = await this.inboxService.sendMessage(user.uid, {
                text,
                toNumber,
                toName,
                chatId,
                type: "text",
            });
            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }

    async sendMetaTemplate(req, res, next) {
        try {
            const { template, toNumber, toName, chatId, example } = req.body;
            const user = req.decode;
            if (!template) {
                throw new ProvideTemplateException();
            }
            await this.inboxService.sendMetaTemplate(user.uid, {
                template,
                toNumber,
                toName,
                chatId,
                example,
            });
            return formSuccess(res, { msg: __t(template_message_sent) });
        } catch (err) {
            next(err);
        }
    }

    
}

module.exports = WhatsappChatController