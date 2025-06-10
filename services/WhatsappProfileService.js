const ChatRepository = require("../repositories/ChatRepository");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const WhatsappAuthApi = require("../api/Whatsapp/WhatsappAuthApi");
const { WHATSAPP } = require("../types/social-platform-types");

class WhatsappProfileService {
  constructor(user = null, accessToken = null) {
    this.user = user;
    this.chatRepository = new ChatRepository();
    this.socialAccountRepository = new SocialAccountRepository();
    this.whatsappAuthApi = new WhatsappAuthApi(user, accessToken);
  }

  async getProfiles() {
    return this.socialAccountRepository.find({
      where: {
        uid: this.user.uid,
        platform: WHATSAPP,
      }
    });
  }

  async deleteProfile(wabaId) {
    const profile = await this.socialAccountRepository.findFirst({
      social_account_id: wabaId
    });
    await this.whatsappAuthApi.initMeta();

    this.whatsappAuthApi
      .setToken(profile.token)
      .unsubscribeWebhook(wabaId).catch((err) => console.log(err));

    return this.socialAccountRepository.delete({
      social_account_id: wabaId
    });
  }
};


module.exports = WhatsappProfileService