const MessangerWebhookService = require("../services/MessangerWebhookService");
const { verifyMetaWebhook } = require("../utils/facebook.utils");
const { formSuccess } = require("../utils/response.utils");

class MessengerWebhookController {
  constructor() {
  }
  async handleWebhook(req, res, next) {
    try {
      const webhookPayload = req.body;

      console.log({
        Messenger: JSON.stringify(webhookPayload)
      })

      await (new MessangerWebhookService()).processIncomingMessages(webhookPayload);
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

module.exports = MessengerWebhookController;
