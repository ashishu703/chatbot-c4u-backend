const FacebookException = require("../../exceptions/FacebookException");
const MessangerChatService = require("../../services/_messanger/MessangerChatService");
const { verifyMetaWebhook } = require("../../utils/facebook.utils");
const MessangerController = require("./MessangerController");


module.exports = class InstagramWebhookController extends MessangerController {
    async handleWebhook(req, res, next) {
        try {
            const webhookPayload = req.body;
            const chatService = new MessangerChatService();
            await chatService.initMeta();
            await chatService.processIncomingMessages(webhookPayload);
            res.status(200).json({ msg: "success" });
        }
        catch (err) {
            next(err);
        }
    }


    async verifyWebhook(req, res) {
        const {
            status,
            message,
            data
        } = await verifyMetaWebhook(req);


        console.log( status,
            message,
            data);
      
        return res.status(status).send(data);
    }


}