const ChatRepository = require("../../repositories/ChatRepository");
const WhatsappProfileRepository = require("../../repositories/WhatsappProfileRepository");
const WhatsappService = require("./WhatsappService");



module.exports = class WhatsappProfileService extends WhatsappService {

    constructor(user, accessToken) {
        super(user, accessToken);
    }


    async saveProfile(phoneNumberId, wabaId, pin) {
        await this.initMeta();
        await WhatsappProfileRepository.updateOrCreate(wabaId, wabaId, this.accessToken, phoneNumberId, this.user.uid, this.AppId, pin);
        return {
            userId: this.user.uid,
            pin,
            wabaId,
            phoneNumberId,
            accessToken: this.accessToken
        }
    }

    async getProfiles() {
        return WhatsappProfileRepository.findManyByUserId(this.user.uid);
    }

    async deleteProfile(wabaId) {
        await ChatRepository.removePlatformChat(this.user.uid, 'WHATSAPP');
        return WhatsappProfileRepository.deleteByAccountId(wabaId);
    }

}