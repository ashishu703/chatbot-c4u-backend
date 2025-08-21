const WhatsappWebhookService = require("../services/WhatsappWebhookService");
const { verifyMetaWebhook } = require("../utils/meta.utils");
const { formWebhookResponse } = require("../utils/response.utils");


class WhatsappWebhookController {
    constructor() {
        this.whatsappWebhookService = new WhatsappWebhookService();
    }
    async handleWebhook(req, res, next) {
        try {
            const webhookPayload = req.body;
            console.log({
                Whatsapp: JSON.stringify(webhookPayload)
            })
            await this.whatsappWebhookService.processIncomingWebhook(webhookPayload);
            return formWebhookResponse(res);
        } catch (err) {
            console.log({
                error: err
            });
            return formWebhookResponse(res);
        }
    }

    async verifyWebhook(req, res) {
        const { status, message, data } = await verifyMetaWebhook(req);
        res.set("Content-Type", "text/plain");
        return res.status(status).send(data);
    }
}

module.exports = WhatsappWebhookController