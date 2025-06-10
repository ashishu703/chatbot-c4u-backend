const FacebookException = require("../exceptions/FacebookException");
const MessangerChatService = require("../services/MessangerChatService");
const { verifyMetaWebhook } = require("../utils/facebook.utils");
const { formSuccess } = require("../utils/response.utils");

class InstagramWebhookController {
  async handleWebhook(req, res, next) {
    try {
      const webhookPayload = req.body;
      const chatService = new MessangerChatService();
      await chatService.initMeta();
      await chatService.processIncomingMessages(webhookPayload);
      return formSuccess(res, { msg: "success" });
    } catch (err) {
      next(err);
    }
  }

  async verifyWebhook(req, res) {
    const { status, message, data } = await verifyMetaWebhook(req);

    console.log(status, message, data);

    return res.status(status).send(data);
  }
};

module.exports = InstagramWebhookController;
