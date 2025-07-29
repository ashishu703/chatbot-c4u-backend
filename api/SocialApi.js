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

    async handleResponse(response) {
        const contentType = response.headers.get("content-type");

        if (!response.ok) {
            if (contentType && contentType.includes("application/json")) {
                const parsedError = await response.json();
                const userMessage =
                    parsedError?.error?.error_user_msg ||
                    parsedError?.error?.message ||
                    "Unknown error occurred";

                // Throw a proper CustomException with the message
                throw new CustomException(userMessage, response.status);
            } else {
                const errorText = await response.text();
                throw new CustomException(`Request failed: ${response.status} - ${errorText}`, response.status);
            }
        }

        return contentType && contentType.includes("application/json")
            ? response.json()
            : response.text();
    }
}

module.exports = SocialApi;
