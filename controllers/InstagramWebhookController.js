const InstagramWebhookService = require("../services/InstagramWebhookService");
const { verifyMetaWebhook } = require("../utils/meta.utils");
const { formWebhookResponse } = require("../utils/response.utils");

class InstagramWebhookController {
  async handleWebhook(req, res, next) {
    try {
      const webhookPayload = req.body;
      console.log({
        Instagram: JSON.stringify(webhookPayload)
      });
      await (new InstagramWebhookService()).processIncomingWebhook(webhookPayload);
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
    return res.status(status).send(data);
  }
};
module.exports = InstagramWebhookController