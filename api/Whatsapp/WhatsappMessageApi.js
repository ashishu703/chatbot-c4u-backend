const { WHATSAPP } = require("../../types/social-platform-types");
const WhatsappApi = require("./WhatsappApi");
class WhatsappMessageApi extends WhatsappApi {
    constructor(user = null, accessToken = null, wabaId = null) {
        super(user, accessToken, wabaId);
    }


   
};

module.exports = WhatsappMessageApi;
