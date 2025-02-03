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
        const response = await this.post('/oauth/access_token', {
            client_id: this.AppId,
            client_secret: this.AppSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: INSTAGRAM_REDIRECT_URI
        })

        const { access_token } = response;

        this.accessToken = access_token;

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