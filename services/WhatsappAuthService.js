const WhatsappAuthApi = require("../api/Whatsapp/WhatsappAuthApi");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");

class WhatsappAuthService {
  constructor(user, accessToken) {
    this.user = user;
    this.whatsappAuthApi = new WhatsappAuthApi(user, accessToken);
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async initiateUserAuth(code, phoneNumberId, wabaId) {
    await this.whatsappAuthApi.initMeta();
    const { access_token: accessToken } = await this.whatsappAuthApi.getLongLiveToken(code);
    this.whatsappAuthApi.setToken(accessToken);

    this.whatsappAuthApi.registerAccount(phoneNumberId)
      .catch((err) => { console.log("Account Registration Failed", err) });

    this.whatsappAuthApi.subscribeWebhook(wabaId)
      .catch((err) => { console.log("Webhook Subscription Failed", err) });

    const accountInfo = await this.whatsappAuthApi.getOwnerProfile();

    return this.saveCurrentSession(accountInfo, accessToken, phoneNumberId, wabaId);
  }



  async saveCurrentSession(accountInfo, accessToken, phoneNumberId, wabaId) {
    const { name, id: socialUserId } = accountInfo;
    return this.socialAccountRepository.updateOrCreateWhatsappProfile(
      this.user.uid,
      wabaId,
      phoneNumberId,
      socialUserId,
      name,
      accessToken,
    );
  }





};

module.exports = WhatsappAuthService