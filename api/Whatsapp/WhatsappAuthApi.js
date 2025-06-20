const { whatsAppAccountPin, backendURI } = require("../../config/app.config");
const WhatsappApi = require("./WhatsappApi");

class WhatsappAuthApi extends WhatsappApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }


    async getLongLiveToken(code) {
        return this.get("/oauth/access_token", {
            client_id: this.AppId,
            client_secret: this.AppSecret,
            grant_type: "authorization_code",
            code: code,
        });
    }


    async registerAccount(phoneNumberId) {
        return this.post(`/${phoneNumberId}/register`, {
            messaging_product: "whatsapp",
            whatsAppAccountPin,
        });
    }

    async getOwnerProfile() {
        return this.get("/me");
    }

    async getNumberInfo(phoneNoId) {
        return this.get(`/${phoneNoId}`);
    }


    async subscribeWebhook(wabaId) {
        return this.post(`/${wabaId}/subscribed_apps`, {
            override_callback_uri: `${backendURI}/api/whatsapp/webhook`,
            verify_token: this.webhookVerificationToken,
        });
    }

    async unsubscribeWebhook(wabaId) {
        return this.post(`/${wabaId}/subscribed_apps`, {});
    }
};

module.exports = WhatsappAuthApi
