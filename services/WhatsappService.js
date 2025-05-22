const WebPublicRepository = require("../../repositories/WebPublicRepository");
const { handleApiResponse } = require("../../utils/facebook.utils");
const fetch = require("node-fetch");
module.exports = class WhatsappService {
  AppId;
  AppSecret;
  DefaultApiVersion;
  APIURL;
  scopes;
  accessToken;
  constructor(user, accessToken) {
    (this.accessToken = accessToken), (this.user = user);
  }

  async initMeta() {
    const {
      whatsapp_client_id,
      whatsapp_client_secret,
      whatsapp_graph_version,
      config_id,
    } = await WebPublicRepository.getSetting();

    this.AppId = whatsapp_client_id;
    this.AppSecret = whatsapp_client_secret;
    this.DefaultApiVersion = whatsapp_graph_version;
    this.APIURL = `https://graph.facebook.com/${this.DefaultApiVersion}`;
    this.scopes = config_id;
  }

  async post(url, data, query = []) {
    const queryString = new URLSearchParams(query).toString();
    const options = {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    };
    const response = await fetch(
      `${this.APIURL}${url}?${queryString}`,
      options
    );
    return handleApiResponse(response);
  }

  async get(url, query = []) {
    const options = {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
    const queryString = new URLSearchParams(query).toString();
    const response = await fetch(
      `${this.APIURL}${url}?${queryString}`,
      options
    );

    return handleApiResponse(response);
  }
};
