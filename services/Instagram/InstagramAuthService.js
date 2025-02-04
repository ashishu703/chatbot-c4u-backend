const { FACEBOOK_TYPE_KEY, INSTAGRAM_REDIRECT_URI, INSTAGRAM_CLIENT_ID } = require("../../constants/instagram.constant");
const SmiUserTokenRepository = require("../../repositories/SmiUserTokenRepository");
const MessangerService = require("./InstagramService");


module.exports = class InstagramAuthService extends MessangerService {
    pageService;
    constructor(user, accessToken) {
        super(user, accessToken);
    }

    async initiateUserAuth(code) {
        await this.getLongLiveToken(code)
        await this.saveCurrentToken();
        return this.accessToken;
    }

    async getLongLiveToken(code) {

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
            body: params.toString(), // Convert URLSearchParams to string
        });

        if (response.ok) {
            const { access_token } = response.json();
            this.accessToken = access_token;
        }

        return access_token;

    }

    async saveCurrentToken() {
        await SmiUserTokenRepository.updateOrCreate(this.user.uid, INSTAGRAM_TYPE_KEY, this.accessToken);
        return this;
    }

    prepareAuthUri() {
        return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`
    }

}