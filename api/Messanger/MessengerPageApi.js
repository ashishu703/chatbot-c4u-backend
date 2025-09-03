const MessengerApi = require("./MessengerApi");

class MessengerPageApi extends MessengerApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async fetchPages() {
        return await this.get("/me/accounts", {
            fields: "id,picture,name,access_token",
        });
    }

    async fetchPosts(pageId, limit = 100) {
        return await this.get(`/${pageId}/posts`, {
            fields: "id,message,story,created_time,updated_time",
            limit: limit,
        });
    }

    async fetchComments(postId, limit = 100) {
        return await this.get(`/${postId}/comments`, {
            fields: "id,from,message,created_time",
            limit: limit,
        });
    }

    async subscribeWebhooks(page_id) {
        return this.post(`/${page_id}/subscribed_apps`, {
            subscribed_fields: [
                "messaging_account_linking",
                "messages",
                "message_reads",
                "message_reactions",
                "message_edits",
                "message_echoes",
                "message_deliveries",
                "message_context",
                "feed",
            ].join(","),
        });
    }

    async unsubscribeWebhooks(page_id) {
        return this.delete(`/${page_id}/subscribed_apps`);
    }
};

module.exports = MessengerPageApi;
