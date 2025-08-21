const InstagramApi = require("./InstagramApi");

class InstagramProfileApi extends InstagramApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async fetchProfile(id) {
        // For Instagram Messaging, allowed fields are name and profile_pic with a Page access token
        return this.get(`/${id}`, {
            fields: "name,profile_pic",
            access_token: this.accessToken,
        });
    }




};

module.exports = InstagramProfileApi;