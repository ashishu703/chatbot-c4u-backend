const { FACEBOOK_CLIENT_ID, FACEBOOK_CLIENT_SECRET, FACEBOOK_DEFAULT_GRAPH_VERSION } = require("../../constants/facebook.contant");
const { handleApiResponse } = require("../../utils/facebook.utils");

module.exports = class FacebookService {
    AppId = FACEBOOK_CLIENT_ID;
    AppSecret = FACEBOOK_CLIENT_SECRET;
    DefaultApiVersion = FACEBOOK_DEFAULT_GRAPH_VERSION;
    APIURL = `https://graph.facebook.com/${this.DefaultApiVersion}`
    accessToken = null;

    constructor(user, accessToken) {
        this.accessToken = accessToken,
            this.user = user
    }


    async post(url, data) {
       
        const options = {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${this.accessToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };
        const response = await fetch(`${this.APIURL}${url}`, options);
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