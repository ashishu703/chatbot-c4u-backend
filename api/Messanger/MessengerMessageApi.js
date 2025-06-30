const MessengerApi = require("./MessengerApi");

class MessengerMessageApi extends MessengerApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async sendMessage(payload) {
        return this.post("/me/messages", payload, {
            access_token: this.accessToken,
        });
    }
};

module.exports = MessengerMessageApi
