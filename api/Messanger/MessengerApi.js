const WebPublicRepository = require("../../repositories/WebPublicRepository");
const SocialApi = require("../SocialApi");
const { handleApiResponse } = require("../../utils/facebook.utils");
const { metaApiVersion } = require("../../config/app.config");
class MessengerApi extends SocialApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
        this.webPublicRepository = new WebPublicRepository();
    }

    async initMeta() {
        const {
            facebook_client_id,
            facebook_client_secret,
            facebook_graph_version,
            facebook_auth_scopes,
        } = await this.webPublicRepository.getWebPublic();

        this.AppId = facebook_client_id;
        this.AppSecret = facebook_client_secret;
        this.DefaultApiVersion = facebook_graph_version;
        this.APIURL = `https://graph.facebook.com/${metaApiVersion}`;
        this.scopes = facebook_auth_scopes;
    }


    handleResponse(response) {
        return handleApiResponse(response)
    }
};

module.exports = MessengerApi