const WebPublicRepository = require("../../repositories/WebPublicRepository");
const SocialApi = require("../SocialApi");
const { handleApiResponse } = require("../../utils/facebook.utils");
class WhatsappApi extends SocialApi {
    webhookVerificationToken;
    constructor(user = null, accessToken = null, wabaId = null) {
        super(user, accessToken);
        this.webPublicRepository = new WebPublicRepository();
        this.wabaId = wabaId;
    }

    setWabaId(wabaId) {
        this.wabaId = wabaId
        return this;
    }

    async initMeta() {
        const {
            whatsapp_client_id,
            whatsapp_client_secret,
            whatsapp_graph_version,
            whatsapp_config_id,
            meta_webhook_verifcation_key
        } = await this.webPublicRepository.getWebPublic();

        this.webhookVerificationToken = meta_webhook_verifcation_key;
        this.AppId = whatsapp_client_id;
        this.AppSecret = whatsapp_client_secret;
        this.DefaultApiVersion = whatsapp_graph_version;
        this.APIURL = `https://graph.facebook.com/${this.DefaultApiVersion}`;
        this.scopes = whatsapp_config_id;
    }


    handleResponse(response) {
        return handleApiResponse(response)
    }
};

module.exports = WhatsappApi