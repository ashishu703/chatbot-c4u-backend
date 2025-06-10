const { verifyMetaWebhook } = require("../utils/facebook.utils");


 class WhatsappWebhookController{
    async verifyWebhook(req, res) {
        const {
            status,
            message,
            data
        } = await verifyMetaWebhook(req);


        console.log(status,
            message,
            data);

        return res.status(status).send(data);
    }
}

module.exports = WhatsappWebhookController