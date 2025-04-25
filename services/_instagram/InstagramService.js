const WebPublicRepository = require("../../repositories/webPublicRepository");
const { handleApiResponse } = require("../../utils/facebook.utils");
const fetch = require("node-fetch");

module.exports = class InstagramService {
    AppId;
    AppSecret;
    DefaultApiVersion;
    APIURL;
    scopes;
    accessToken;
    redirectUri;

    constructor(user, accessToken) {
        this.accessToken = accessToken,
            this.user = user
    }


    async initMeta() {
        const {
            instagram_client_id,
            instagram_client_secret,
            instagram_graph_version,
            instagram_auth_scopes,
            instagram_redirect_url
        } = await WebPublicRepository.getSetting();

       
        
        this.AppId = instagram_client_id;
        this.AppSecret = instagram_client_secret;
        this.DefaultApiVersion = instagram_graph_version;
        this.APIURL = `https://graph.instagram.com/${this.DefaultApiVersion}`
        this.scopes = instagram_auth_scopes
        this.redirectUri = instagram_redirect_url
    }


    async post(url, data, query = []) {
        const queryString = new URLSearchParams(query).toString();
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        const response = await fetch(`${this.APIURL}${url}?${queryString}`, options);
        return handleApiResponse(response);
    }


    async get(url, query = []) {

        const options = {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`
            }
        };
        const queryString = new URLSearchParams(query).toString();
        const response = await fetch(`${this.APIURL}${url}?${queryString}`, options);

        return handleApiResponse(response);
    }

}