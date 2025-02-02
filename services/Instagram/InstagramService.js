const { INSTAGRAM_CLIENT_ID, INSTAGRAM_CLIENT_SECRET, INSTAGRAM_DEFAULT_GRAPH_VERSION } = require("../../constants/instagram.constant");
const { handleApiResponse } = require("../../utils/facebook.utils");
const fetch = require("node-fetch");

module.exports = class InstagramService {
    AppId = INSTAGRAM_CLIENT_ID;
    AppSecret = INSTAGRAM_CLIENT_SECRET;
    DefaultApiVersion = INSTAGRAM_DEFAULT_GRAPH_VERSION;
    APIURL = `https://graph.instagram.com/${this.DefaultApiVersion}`
    accessToken = null;

    constructor(user, accessToken) {
        this.accessToken = accessToken,
            this.user = user
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