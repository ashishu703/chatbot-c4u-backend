const { frontendURI } = require("../config/app.config");
const WebPublicRepository = require("../repositories/WebPublicRepository");


class SmiService {
  constructor() {
    this.webPublicRepository = new WebPublicRepository();
  }
  async getAuthParams() {

    const webPublic = await this.webPublicRepository.getWebPublic();

    const {
      facebook_client_id,
      facebook_graph_version,
      facebook_auth_scopes,
      instagram_client_id,
      instagram_auth_scopes,
      whatsapp_client_id,
      whatsapp_graph_version,
      whatsapp_config_id,
    } = webPublic;
    return {
      facebook: {
        clientId: facebook_client_id,
        version: facebook_graph_version,
        scopes: facebook_auth_scopes,
      },
      instagram: {
        authURI: this.prepareInstagramAuthUri(instagram_client_id, instagram_auth_scopes),
      },
      whatsapp: {
        clientId: whatsapp_client_id,
        version: whatsapp_graph_version,
        configId: whatsapp_config_id,
      },
    };
  }


  prepareInstagramAuthUri(clientId, scopes) {
    return `https://www.instagram.com/oauth/authorize?enable_fb_login=0&force_authentication=1&client_id=${clientId}&redirect_uri=${this.prepareInstagramRedirectUri()}&response_type=code&scope=${scopes}`;
  }

  prepareInstagramRedirectUri() {
    return frontendURI + "/auth-code-manager";
  }
}

module.exports = SmiService;
