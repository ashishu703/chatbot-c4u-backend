const ChatRepository = require("../repositories/ChatRepository");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const WhatsappAuthApi = require("../api/Whatsapp/WhatsappAuthApi");
const { WHATSAPP } = require("../types/social-platform-types");

class WhatsappProfileService {
  constructor(user = null, accessToken = null) {
    this.chatRepository = new ChatRepository();
    this.socialAccountRepository = new SocialAccountRepository();
    this.whatsappAuthApi = new WhatsappAuthApi(user, accessToken);
  }

  async getProfiles() {
    return this.socialAccountRepository.findFirst({
      uid: this.user.uid,
      platform: WHATSAPP
    });
  }

  async deleteProfile(wabaId) {
    await this.chatRepository.removePlatformChat(this.user.uid, WHATSAPP);
    const profile = await this.socialAccountRepository.findFirst({
      social_account_id: wabaId
    });
    await this.whatsappAuthApi.setToken(profile.access_token).unsubscribeWebhook(wabaId);
    return this.socialAccountRepository.delete({
      social_account_id: wabaId
    });
  }
};


module.exports = WhatsappProfileService