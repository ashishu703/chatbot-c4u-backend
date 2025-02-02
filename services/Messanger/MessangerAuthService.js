const { FACEBOOK_TYPE_KEY } = require("../../constants/messanger.constant");
const SmiUserTokenRepository = require("../../repositories/SmiUserTokenRepository");
const MessangerService = require("./MessangerService");


module.exports = class MessangerAuthService extends MessangerService {
    pageService;
    constructor(user, accessToken) {
        super(user, accessToken);
    }

    async initiateUserAuth() {
        await this.getLongLiveToken()
        await this.saveCurrentToken();
        return true;
    }



    async getLongLiveToken() {
        const response = await this.get('/oauth/access_token', {
            client_id: this.AppId,
            client_secret: this.AppSecret,
            grant_type: 'fb_exchange_token',
            fb_exchange_token: this.accessToken
        })

        const { access_token } = response;

        this.accessToken = access_token;

        return access_token;

    }

    async saveCurrentToken() {
        await SmiUserTokenRepository.updateOrCreate(this.user.uid, FACEBOOK_TYPE_KEY, this.accessToken);
        return this;
    }

}