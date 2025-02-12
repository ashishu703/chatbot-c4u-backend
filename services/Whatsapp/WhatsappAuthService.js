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
        return this.saveCurrentSession(phoneNumberId, wabaId);
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



    async saveCurrentSession(phoneNumberId, wabaId) {
        const whatsappProfileService = new WhatsappProfileService(this.user, this.accessToken);
        const profile = await whatsappProfileService.saveProfile(phoneNumberId, wabaId);
        return profile
    }

}