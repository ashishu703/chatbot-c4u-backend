import InstagramApi from "./InstagramApi";
class InstagramAuthApi extends InstagramApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    getAuthorizationUrl() {
        return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${this.AppId}&redirect_uri=${this.redirectUri}&response_type=code&scope=${this.scopes}`;
    }


    async authorizeAuthCode(code) {
        const url = "https://api.instagram.com/oauth/access_token";

        const data = {
            client_id: this.AppId,
            client_secret: this.AppSecret,
            grant_type: "authorization_code",
            redirect_uri: this.redirectUri,
            code: code,
        };

        return await this.post(url, data, {}, {
            "Content-Type": "application/x-www-form-urlencoded",
        });
    }


    async getLongLiveToken() {
        return this.get("/access_token", {
            access_token: this.accessToken,
            grant_type: "ig_exchange_token",
            client_secret: this.AppSecret,
        });
    }
};

module.exports = InstagramAuthApi
