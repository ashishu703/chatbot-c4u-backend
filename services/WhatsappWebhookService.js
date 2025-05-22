const { generateRandomNumber } = require("../../utils/others.utils");
const WhatsappProfileService = require("./WhatsappProfileService");
const WhatsappService = require("./WhatsappService");

module.exports = class WhatsappWebhookService extends WhatsappService {
  constructor(user, accessToken) {
    super(user, accessToken);
  }

  async subscribeWebhook(wabaId) {
    return this.post(`/${wabaId}/subscribed_apps`, {
      override_callback_uri: `${process.env.BACKURI}/api/inbox/webhook/${this.user.uid}`,
      verify_token: this.user.uid,
    });
  }

  async unsubscribeWebhook(wabaId) {
    return this.post(`/${wabaId}/subscribed_apps`, {});
  }
};
