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

    async request(method, url, data = null, query = {}) {
        const queryString = new URLSearchParams(query).toString();
        const fullUrl = `${this.APIURL}${url}${queryString ? `?${queryString}` : ''}`;

        const headers = {
            Authorization: `Bearer ${this.accessToken}`,
            ...(method === "POST" && { "Content-Type": "application/json" }),
        };

        const options = {
            method,
            headers,
            ...(data && { body: JSON.stringify(data) }),
        };

        const response = await fetch(fullUrl, options);
        return this.handleResponse(response);
    }

    get(url, query = {}) {
        return this.request("GET", url, null, query);
    }

    post(url, data = {}, query = {}) {
        return this.request("POST", url, data, query);
    }

    delete(url, query = {}) {
        return this.request("DELETE", url, null, query);
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
