const { WHATSAPP } = require("../../types/social-platform-types");
const WhatsappApi = require("./WhatsappApi");
class WhatsappMessageApi extends WhatsappApi {
    constructor(user = null, accessToken = null, wabaId = null) {
        super(user, accessToken, wabaId);
    }


    async send(payload) {
        return this.post(`/${this.wabaId}/messages`, {
            messaging_product: "whatsapp",
            recipient_type: "individual",
            ...payload
        });
    }



};

module.exports = WhatsappMessageApi;
