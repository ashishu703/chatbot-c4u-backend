const { generateRandomNumber } = require("../../utils/others.utils");
const WhatsappProfileService = require("./WhatsappProfileService");
const WhatsappService = require("./WhatsappService");


module.exports = class WhatsappAuthService extends WhatsappService {
    constructor(user, accessToken) {
        super(user, accessToken);
    }

    async initiateUserAuth(code,
        phoneNumberId,
        wabaId
    ) {

        await this.getLongLiveToken(code)
        const pin = await this.registerAccount(phoneNumberId);
        return this.saveCurrentSession(phoneNumberId, wabaId, pin);
    }



    async getLongLiveToken(code) {
        const response = await this.get('/oauth/access_token', {
            client_id: this.AppId,
            client_secret: this.AppSecret,
            grant_type: 'authorization_code',
            code: code
        })

        const { access_token } = response;

        this.accessToken = access_token;

        return access_token;
    }



    async saveCurrentSession(phoneNumberId, wabaId, pin) {
        const whatsappProfileService = new WhatsappProfileService(this.user, this.accessToken);
        const profile = await whatsappProfileService.saveProfile(phoneNumberId, wabaId, pin);
        return profile
    }


    async registerAccount(phoneNumberId) {
        const pin = generateRandomNumber(6);
        await this.post(`${phoneNumberId}/register`, { messaging_product: "whatsapp", pin });
        return pin;
    }

}