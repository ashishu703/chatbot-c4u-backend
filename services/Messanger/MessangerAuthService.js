const { MESSANGER_TYPE_KEY } = require("../../constants/messanger.constant");
const FacebookProfileRepository = require("../../repositories/FacebookProfileRepository");
const FacebookProfileService = require("./FacebookProfileService");
const MessangerService = require("./MessangerService");


module.exports = class MessangerAuthService extends MessangerService {
    pageService;
    constructor(user, accessToken) {
        super(user, accessToken);
    }

    async initiateUserAuth() {
        await this.getLongLiveToken()
        return this.saveCurrentSession();
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

    async saveCurrentSession() {
        const facebookProfileService = new FacebookProfileService(this.user, this.accessToken);
        return facebookProfileService.fetchAndSaveProfileInformation();
    }

}