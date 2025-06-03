const WhatsappAuthApi = require("../api/Whatsapp/WhatsappAuthApi");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");

class WhatsappAuthService {
  constructor(user, accessToken) {
    this.whatsappAuthApi = new WhatsappAuthApi(user, accessToken);
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async initiateUserAuth(code, phoneNumberId, wabaId) {
    const { access_token } = await this.whatsappAuthApi.getLongLiveToken(code);
    this.whatsappAuthApi.setToken(access_token);
    this.whatsappAuthApi.registerAccount(phoneNumberId).catch((err) => { });
    await this.whatsappAuthApi.subscribeWebhook(wabaId);
    return this.saveCurrentSession(phoneNumberId, wabaId);
  }



  async saveCurrentSession(phoneNumberId, wabaId, pin) {
    return this.socialAccountRepository.updateOrCreateWhatsappProfile(
      this.user,
      this.accessToken
    );
  }



};

module.exports = WhatsappAuthService