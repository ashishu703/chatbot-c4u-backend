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
            facebook_client_id,
            facebook_client_secret,
            facebook_graph_version,
            facebook_auth_scopes,
            instagram_client_id,
            instagram_client_secret,
            instagram_graph_version,
            instagram_auth_scopes,
            instagram_redirect_url,
        } = await this.webPublicRepository.getWebPublic();

        this.AppId = facebook_client_id || instagram_client_id;
        this.AppSecret = facebook_client_secret || instagram_client_secret;
        this.APIURL = `https://graph.facebook.com/${instagram_graph_version || 'v18.0'}`;
        this.oauthGraphVersion = facebook_graph_version || 'v18.0';
        this.scopes = facebook_auth_scopes || instagram_auth_scopes;
        this.redirectUri = instagram_redirect_url;
        this.subscribedFields = [
            "messages",
            "message_reads",
            "messaging_handovers"
        ];
    }


    handleResponse(response) {
        return handleApiResponse(response)
    }
};

module.exports = InstagramApi