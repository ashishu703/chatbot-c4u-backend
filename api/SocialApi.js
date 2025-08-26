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

    async request(method, url, data = null, query = {}, customHeaders = {}, forcedOptions = {}) {
        const queryString = new URLSearchParams(query).toString();

        const isFullUrl = /^https?:\/\//i.test(url);

        const fullUrl = isFullUrl ? `${url}${queryString ? `?${queryString}` : ''}` : `${this.APIURL}${url}${queryString ? `?${queryString}` : ''}`;

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
            ...forcedOptions
        };
        const response = await fetch(fullUrl, options);
        console.log("response",response);
        if (!response.ok) {
            try { console.log('Meta API error', await response.clone().text()); } catch (e) {}
        } 
        return this.handleResponse(response);
    }

    get(url, query = {}, customHeaders = {}, forcedOptions = {}) {
        return this.request("GET", url, null, query, customHeaders, forcedOptions = {});
    }

    post(url, data = {}, query = {}, customHeaders = {}, forcedOptions = {}) {
        return this.request("POST", url, data, query, customHeaders, forcedOptions = {});
    }

    delete(url, query = {}, customHeaders = {}, forcedOptions = {}) {
        return this.request("DELETE", url, null, query, customHeaders, forcedOptions = {});
    }

    
}

module.exports = SocialApi;
