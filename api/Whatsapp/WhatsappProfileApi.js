const WhatsappApi = require("./WhatsappApi");
class WhatsappProfileApi extends WhatsappApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async fetchProfile(mobileId) {
        return this.get(`/${mobileId}`, { access_token: this.accessToken });
    }

    


};

module.exports = WhatsappProfileApi;
