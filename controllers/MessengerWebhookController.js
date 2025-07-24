const MessangerWebhookService = require("../services/MessangerWebhookService");
const { verifyMetaWebhook } = require("../utils/meta.utils");
const { formWebhookResponse } = require("../utils/response.utils");

class MessengerWebhookController {
  constructor() {
  }
  async handleWebhook(req, res, next) {
    try {
      const webhookPayload = req.body;
      console.log("Messenger Webhook Payload", {
        Messenger: JSON.stringify(webhookPayload)
      })
      await (new MessangerWebhookService()).processIncomingMessages(webhookPayload);
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

    console.log(status, message, data);

    return res.status(status).send(data);
  }
};

module.exports = MessengerWebhookController;
