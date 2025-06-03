const InstagramApi = require("./InstagramApi");

class InstagramMessageApi extends InstagramApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async sendMessage(payload) {
        return this.post("/me/messages", payload, {
            access_token: this.accessToken,
        });
    }




};

module.exports = InstagramMessageApi;