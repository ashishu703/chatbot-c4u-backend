const { MESSANGER_TYPE_KEY, INSTAGRAM_REDIRECT_URI, INSTAGRAM_CLIENT_ID, INSTAGRAM_TYPE_KEY } = require("../../constants/instagram.constant");
const FacebookException = require("../../exceptions/FacebookException");
const SmiUserTokenRepository = require("../../repositories/SmiUserTokenRepository");
const MessangerService = require("./InstagramService");
const fetch = require("node-fetch");

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

        const data = await response.json();
        
        if (!response.ok)  throw new FacebookException("Token verification failed.")
         
        const {access_token} = data;
     
        this.accessToken = access_token;
        
        return this.accessToken;

    }

    async saveCurrentToken() {
        await SmiUserTokenRepository.updateOrCreate(this.user.uid, INSTAGRAM_TYPE_KEY, this.accessToken);
        return this;
    }

    prepareAuthUri() {
        return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${INSTAGRAM_CLIENT_ID}&redirect_uri=${INSTAGRAM_REDIRECT_URI}&response_type=code&scope=instagram_business_basic%2Cinstagram_business_manage_messages%2Cinstagram_business_manage_comments%2Cinstagram_business_content_publish%2Cinstagram_business_manage_insights`
    }

}