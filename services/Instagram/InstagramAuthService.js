const { MESSANGER_TYPE_KEY, INSTAGRAM_REDIRECT_URI, INSTAGRAM_CLIENT_ID, INSTAGRAM_TYPE_KEY } = require("../../constants/instagram.constant");
const FacebookException = require("../../exceptions/FacebookException");
const FacebookProfileRepository = require("../../repositories/FacebookProfileRepository");
const InstagramProfileService = require("./InstagramProfileService");
const MessangerService = require("./InstagramService");
const fetch = require("node-fetch");

module.exports = class InstagramAuthService extends MessangerService {
    pageService;
    userId;

    constructor(user, accessToken) {
        super(user, accessToken);
    }

    async initiateUserAuth(code) {
        await this.getToken(code)
        await this.saveCurrentSession();
        return this;
    }

    async getToken(code) {
        await this.authorizeAuthCode(code);
        await this.getLongLiveToken()
        return this.accessToken;
    }

    async saveCurrentSession() {

        const profileService = new InstagramProfileService(this.user, this.accessToken);

        await profileService.fetchAndSaveProfile(this.userId)

        return this;
    }

    async getLongLiveToken() {
        const { access_token: longLiveToken } = await this.get("/access_token", {
            access_token: this.accessToken,
            grant_type: "ig_exchange_token",
            client_secret: this.AppSecret,
        });

        this.accessToken = longLiveToken;

        return this;
    }


    async authorizeAuthCode(code) {
        const url = 'https://api.instagram.com/oauth/access_token';

        const params = new URLSearchParams();
        params.append('client_id', this.AppId);
        params.append('client_secret', this.AppSecret);
        params.append('grant_type', 'authorization_code');
        params.append('redirect_uri', INSTAGRAM_REDIRECT_URI);
        params.append('code', code);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
            body: params.toString(),
        });


        if (!response.ok) throw new FacebookException("Token verification failed.")

        const {
            user_id,
            access_token,
        } = await response.json();

        this.userId = user_id;

        this.accessToken = access_token;

        return this;
    }


    prepareAuthUri() {
        return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=1803679193781597&redirect_uri=https://omnichat.karobar.org/auth-code-manager&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish`
        // return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`
    }

}