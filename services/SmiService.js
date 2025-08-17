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
      instagram_redirect_url,
    } = webPublic;

    // Prefer Facebook scopes for Meta OAuth; fallback to Instagram scopes if provided there
    const metaScopes = facebook_auth_scopes && facebook_auth_scopes.length
      ? facebook_auth_scopes
      : instagram_auth_scopes;

    // Determine redirect URI for Meta callback
    const redirectUri = instagram_redirect_url || this.prepareInstagramRedirectUri();
    return {
      facebook: {
        clientId: facebook_client_id,
        version: facebook_graph_version,
        scopes: facebook_auth_scopes,
      },
      instagram: {
        // Build Instagram auth via Facebook Login dialog with state for platform detection
        authURI: this.prepareInstagramAuthUri(
          // Use the Facebook/Meta App ID. Many installs store it under instagram_client_id; prefer facebook_client_id when available.
          facebook_client_id || instagram_client_id,
          metaScopes,
          redirectUri,
          facebook_graph_version
        ),
      },
      whatsapp: {
        clientId: whatsapp_client_id,
        version: whatsapp_graph_version,
        configId: whatsapp_config_id,
      },
    };
  }


  prepareInstagramAuthUri(clientId, scopes, redirectUri, version = "v18.0") {
    const state = `instagram_${Date.now()}`;
    const params = new URLSearchParams({
      client_id: clientId || "",
      redirect_uri: redirectUri,
      response_type: "code",
      scope: scopes || "",
      state,
      auth_type: "rerequest",
      display: "popup",
    });
    return `https://www.facebook.com/${version || "v18.0"}/dialog/oauth?${params.toString()}`;
  }

  prepareInstagramRedirectUri() {
    // Route implemented in dev frontend to process Meta OAuth callback
    return frontendURI + "/api/user/auth/meta/callback";
  }
}

module.exports = SmiService;
