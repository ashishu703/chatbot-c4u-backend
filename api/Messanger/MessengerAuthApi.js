const MessengerApi = require("./MessengerApi");

class MessengerAuthApi extends MessengerApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }


    async getLongLiveToken() {
        return this.get("/oauth/access_token", {
            access_token: this.accessToken,
            grant_type: "fb_exchange_token",
            fb_exchange_token: this.accessToken,
            client_secret: this.AppSecret,
        });
    }
};

module.exports = MessengerAuthApi
