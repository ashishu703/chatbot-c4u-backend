const WhatsappChatService = require("../services/WhatsappChatService");
const { verifyMetaWebhook } = require("../utils/facebook.utils");
const { formSuccess } = require("../utils/response.utils");


class WhatsappWebhookController {
    constructor() {
        this.whatsappWebhookService = new WhatsappChatService();
    }
    async handleWebhook(req, res, next) {
        try {
            const webhookPayload = req.body;
            console.log({
                Whatsapp: JSON.stringify(webhookPayload)
            })
            await this.whatsappWebhookService.processIncomingWebhook(webhookPayload);
            return formSuccess(res, {});
        } catch (err) {
            next(err);
        }
    }

    async verifyWebhook(req, res) {
        const { status, message, data } = await verifyMetaWebhook(req);
        return res.status(status).send(data);
    }
}

module.exports = WhatsappWebhookController