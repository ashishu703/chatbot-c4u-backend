const FacebookException = require("../exceptions/FacebookException");
const InstagramChatService = require("../services/InstagramChatService");
const { verifyMetaWebhook } = require("../utils/facebook.utils");
const { formSuccess } = require("../utils/response.utils");
const InstagramController = require("./InstagramController");

module.exports = class InstagramWebhookController extends InstagramController {
  async handleWebhook(req, res, next) {
    try {
      const webhookPayload = req.body;
      const chatService = new InstagramChatService();
      await chatService.initMeta();
      await chatService.processIncomingWebhook(webhookPayload);
      return formSuccess({ msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }

  async verifyWebhook(req, res) {
    const { status, message, data } = await verifyMetaWebhook(req);
    return res.status(status).send(data);
  }
};
