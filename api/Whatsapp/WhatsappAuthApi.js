const { whatsAppAccountPin } = require("../../config/app.config");
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
        this.post(`/${phoneNumberId}/register`, {
            messaging_product: "whatsapp",
            whatsAppAccountPin,
        });
    }


    async subscribeWebhook(wabaId) {
        return this.post(`/${wabaId}/subscribed_apps`, {
            override_callback_uri: `${process.env.BACKURI}/api/inbox/webhook/${this.user.uid}`,
            verify_token: this.user.uid,
        });
    }

    async unsubscribeWebhook(wabaId) {
        return this.post(`/${wabaId}/subscribed_apps`, {});
    }
};

module.exports = WhatsappAuthApi
