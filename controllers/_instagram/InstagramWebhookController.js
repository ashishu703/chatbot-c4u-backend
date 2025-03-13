const FacebookException = require("../../exceptions/FacebookException");
const InstagramChatService = require("../../services/_instagram/InstagramChatService");
const { verifyMetaWebhook } = require("../../utils/facebook.utils");
const InstagramController = require("./InstagramController");


module.exports = class InstagramWebhookController extends InstagramController {
    async handleWebhook(req, res) {
        try {
            const webhookPayload = req.body;
            const chatService = new InstagramChatService();
            await chatService.initMeta();
            await chatService.processIncomingWebhook(webhookPayload);
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
        } = await verifyMetaWebhook(req);
        return res.status(status).send(data);
    }
}