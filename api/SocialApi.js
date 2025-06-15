const fetch = require("node-fetch");

class SocialApi {
    constructor(user = null, accessToken = null) {
        this.user = user;
        this.accessToken = accessToken;
        this.APIURL = '';
        this.AppId = '';
        this.AppSecret = '';
        this.scopes = [];
    }

    setUser(user) {
        this.user = user;
        return this;
    }

    setToken(token) {
        this.accessToken = token;
        return this;
    }

    getToken() {
        return this.accessToken;
    }

    getUser() {
        return this.user;
    }

    async request(method, url, data = null, query = {}, customHeaders = {}) {



        const queryString = new URLSearchParams(query).toString();

        const isFullUrl = /^https?:\/\//i.test(url);

        const fullUrl = isFullUrl ? `${url}${queryString ? `?${queryString}` : ''}` : `${this.APIURL}${url}${queryString ? `?${queryString}` : ''}`;

        console.log({
            url,
            data,
            fullUrl
        })

        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            ...(method === "POST" && { "Content-Type": "application/json" }),
        };

        const options = {
            method,
            headers: {
                ...headers,
                ...customHeaders,
            },
            ...(data && { body: JSON.stringify(data) }),
        };

        const response = await fetch(fullUrl, options);
        return this.handleResponse(response);
    }

    get(url, query = {}, customHeaders = {}) {
        return this.request("GET", url, null, query, customHeaders);
    }

    post(url, data = {}, query = {}, customHeaders = {}) {

        return this.request("POST", url, data, query, customHeaders);
    }

    delete(url, query = {}, customHeaders = {}) {
        return this.request("DELETE", url, null, query, customHeaders);
    }

    async handleResponse(response) {
        if (!response.ok) {
            const error = await response.text();
            throw new Error(`Request failed: ${response.status} - ${error}`);
        }
        return response.json();
    }
}

module.exports = SocialApi;
