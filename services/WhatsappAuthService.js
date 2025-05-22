const { generateRandomNumber } = require("../../utils/others.utils");
const WhatsappProfileService = require("./WhatsappProfileService");
const WhatsappService = require("./WhatsappService");
const WhatsappWebhookService = require("./WhatsappWebhookService");
const pin = process.env.ACCOUNT_SECRET;

module.exports = class WhatsappAuthService extends WhatsappService {
  constructor(user, accessToken) {
    super(user, accessToken);
  }

  async initiateUserAuth(code, phoneNumberId, wabaId) {
    await this.getLongLiveToken(code);
    await this.registerAccount(phoneNumberId);
    await this.subscribeWebhook(wabaId);
    return this.saveCurrentSession(phoneNumberId, wabaId, pin);
  }

  async getLongLiveToken(code) {
    const response = await this.get("/oauth/access_token", {
      client_id: this.AppId,
      client_secret: this.AppSecret,
      grant_type: "authorization_code",
      code: code,
    });

    const { access_token } = response;

    this.accessToken = access_token;

    return access_token;
  }

  async saveCurrentSession(phoneNumberId, wabaId, pin) {
    const whatsappProfileService = new WhatsappProfileService(
      this.user,
      this.accessToken
    );
    return whatsappProfileService.saveProfile(phoneNumberId, wabaId, pin);
  }

  async registerAccount(phoneNumberId) {
    this.post(`/${phoneNumberId}/register`, {
      messaging_product: "whatsapp",
      pin,
    })
      .then((res) => {})
      .catch((err) => {
        console.log(err);
      });
  }

  async subscribeWebhook(wabaId) {
    const webhookService = new WhatsappWebhookService(
      this.user,
      this.accessToken
    );
    await webhookService.initMeta();
    return webhookService.subscribeWebhook(wabaId);
  }
};
