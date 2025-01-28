const FacebookException = require("../../exceptions/FacebookException");
const FacebookChatService = require("../../services/Facebook/FacebookChatService");
const { verifyMetaWebhook } = require("../../utils/facebook.utils");
const FacebookController = require("./FacebookController");


module.exports = class MetaWebhookController extends FacebookController {
    async handleWebhook(req, res) {
        try {
            const webhookPayload = req.body;

            // const webhookPayload = {
            //     "object": "page",
            //     "entry": [
            //         {
            //             "time": 1738058571544,
            //             "id": "102983071499886",
            //             "messaging": [
            //                 {
            //                     "sender": {
            //                         "id": "24529339570048129"
            //                     },
            //                     "recipient": {
            //                         "id": "102983071499886"
            //                     },
            //                     "timestamp": 1738058571046,
            //                     "message": {
            //                         "mid": "m_5BUGT6Lm5e2EqQ_xvYVJ5eSMqUjtB6toIpxyTTyLTNDPzgn-BXU9dTt9vt7vNhxFVCF8AMKWMQcFeTYI1tvK8Q",
            //                         "text": "another"
            //                     }
            //                 }
            //             ]
            //         }
            //     ]
            // }

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