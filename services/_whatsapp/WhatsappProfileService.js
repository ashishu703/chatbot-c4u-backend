const ChatRepository = require("../../repositories/chatRepository");
const WhatsappProfileRepository = require("../../repositories/WhatsappProfileRepository");
const WhatsappService = require("./WhatsappService");
const WhatsappWebhookService = require("./WhatsappWebhookService");

module.exports = class WhatsappProfileService extends WhatsappService {
  constructor(user, accessToken) {
    super(user, accessToken);
  }

  async saveProfile(phoneNumberId, wabaId, pin) {
    await this.initMeta();
    await WhatsappProfileRepository.updateOrCreate(
      wabaId,
      wabaId,
      this.accessToken,
      phoneNumberId,
      this.user.uid,
      this.AppId,
      pin
    );
    return {
      userId: this.user.uid,
      pin,
      wabaId,
      phoneNumberId,
      accessToken: this.accessToken,
    };
  }

  async getProfiles() {
    return WhatsappProfileRepository.findManyByUserId(this.user.uid);
  }

  async deleteProfile(wabaId) {
    await ChatRepository.removePlatformChat(this.user.uid, "WHATSAPP");
    const profile = await WhatsappProfileRepository.getByAccountId(wabaId);
    const webhookService = new WhatsappWebhookService(
      this.user,
      profile.access_token
    );
    await webhookService.initMeta();
    await webhookService.unsubscribeWebhook(wabaId);
    return WhatsappProfileRepository.deleteByAccountId(wabaId);
  }
};
