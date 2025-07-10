const WebPublicRepository = require("../../repositories/WebPublicRepository");
const SocialApi = require("../SocialApi");
const { handleApiResponse } = require("../../utils/meta.utils");
class InstagramApi extends SocialApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
        this.webPublicRepository = new WebPublicRepository();
    }

    async initMeta() {
        const {
            instagram_client_id,
            instagram_client_secret,
            instagram_graph_version,
            instagram_auth_scopes,
            instagram_redirect_url,
        } = await this.webPublicRepository.getWebPublic();

        this.AppId = instagram_client_id;
        this.AppSecret = instagram_client_secret;
        this.APIURL = `https://graph.instagram.com/${instagram_graph_version}`;
        this.scopes = instagram_auth_scopes;
        this.redirectUri = instagram_redirect_url;
        this.subscribedFields = [
            "messages",
            "messaging_seen"
        ];
    }


    handleResponse(response) {
        return handleApiResponse(response)
    }
};

module.exports = InstagramApi