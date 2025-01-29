const FacebookException = require("../../exceptions/FacebookException");
const FacebookChatService = require("../../services/Facebook/FacebookChatService");
const { verifyMetaWebhook } = require("../../utils/facebook.utils");
const FacebookController = require("./FacebookController");


module.exports = class MetaWebhookController extends FacebookController {
    async handleWebhook(req, res) {
        try {
            const webhookPayload = req.body;

            const chatService = new FacebookChatService();

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
        console.log({
            message
        })
        return res.status(status).send(data);
    }


}