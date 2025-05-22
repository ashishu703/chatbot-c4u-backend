const { verifyMetaWebhook } = require("../utils/facebook.utils");
const WhatsappController = require("./WhatsappController");


module.exports = class WhatsappWebhookController extends WhatsappController {
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