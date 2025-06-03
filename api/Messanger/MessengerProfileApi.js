const MessengerApi = require("./MessengerApi");
class MessengerProfileApi extends MessengerApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }


    async fetchOwnerProfile() {
        return this.get("/me", { access_token: this.accessToken });
    }

    async fetchProfile(id) {
        return this.get(`/${id}`, { access_token: this.accessToken });
    }
};

module.exports = MessengerProfileApi;
