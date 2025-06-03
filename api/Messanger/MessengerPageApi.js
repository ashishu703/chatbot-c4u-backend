const MessengerApi = require("./MessengerApi");

class MessengerPageApi extends MessengerApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async fetchPages() {
        return await this.get("/me/accounts?limit=1000", {
            fields: "id,name,access_token",
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
            ].join(","),
        });
    }

    async unsubscribeWebhooks(page_id) {
        return this.delete(`/${page_id}/subscribed_apps`);
    }
};

module.exports = MessengerPageApi;
