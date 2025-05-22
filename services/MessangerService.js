const WebPublicRepository = require("../../repositories/WebPublicRepository");
const { handleApiResponse } = require("../../utils/facebook.utils");
const fetch = require("node-fetch");
module.exports = class MessangerService {
  AppId;
  AppSecret;
  DefaultApiVersion;
  APIURL;
  scopes;
  accessToken;
  constructor(user, accessToken) {
    (this.accessToken = accessToken), (this.user = user);
  }

  setUser(user) {
    this.user = user;
    return this;
  }

  setToken(accessToken) {
    this.accessToken = accessToken;
    return this;
  }

  async initMeta() {
    const {
      facebook_client_id,
      facebook_client_secret,
      facebook_graph_version,
      facebook_auth_scopes,
    } = await WebPublicRepository.getSetting();

    this.AppId = facebook_client_id;
    this.AppSecret = facebook_client_secret;
    this.DefaultApiVersion = facebook_graph_version;
    this.APIURL = `https://graph.facebook.com/${this.DefaultApiVersion}`;
    this.scopes = facebook_auth_scopes;
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

  async delete(url) {
    const options = {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
      },
    };
    const response = await fetch(`${this.APIURL}${url}`, options);
    return handleApiResponse(response);
  }
};
