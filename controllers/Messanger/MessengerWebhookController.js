const FacebookException = require("../../exceptions/FacebookException");
const MessangerChatService = require("../../services/Messanger/MessangerChatService");
const { verifyMetaWebhook } = require("../../utils/facebook.utils");
const MessangerController = require("./MessangerController");


module.exports = class InstagramWebhookController extends MessangerController {
    async handleWebhook(req, res) {
        try {
            const webhookPayload = req.body;
            const chatService = new MessangerChatService();
            await chatService.init();
            await chatService.processIncomingMessages(webhookPayload);
            res.status(200).json({ msg: "success" });
        }
        catch (err) {
            console.log(err);
            if (err instanceof FacebookException) {
                return res.status(400).json(err);
            }
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }


    async verifyWebhook(req, res) {
        const {
            status,
            message,
            data
        } = verifyMetaWebhook(req);
        return res.status(status).send(data);
    }


}