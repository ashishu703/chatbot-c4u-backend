const SmiService = require("../../services/SmiService");
const fetch = require("node-fetch");
const InstagramApi = require("./InstagramApi");
class InstagramAuthApi extends InstagramApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }




    async authorizeAuthCode(code) {

        const url = 'https://api.instagram.com/oauth/access_token';

        const params = new URLSearchParams();
        params.append('client_id', this.AppId);
        params.append('client_secret', this.AppSecret);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', (new SmiService()).prepareInstagramRedirectUri());
        params.append('code', code);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });

        return this.handleResponse(response);
    }


    async getLongLiveToken() {
        return this.get("/access_token", {
            access_token: this.accessToken,
            grant_type: "ig_exchange_token",
            client_secret: this.AppSecret,
        });
    }

    async fetchOwnerProfile() {
        return this.get(`/me`, {
            fields: "id,profile_picture_url,username,name,user_id",
            access_token: this.accessToken,
        });
    }

    async subscribeWebhook() {
        return this.post("/me/subscribed_apps", {}, {
            access_token: this.accessToken,
            subscribed_fields: this.subscribedFields.join(",")
        });
    }
};

module.exports = InstagramAuthApi
