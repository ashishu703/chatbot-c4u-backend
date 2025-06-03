const InstagramApi = require("./InstagramApi");

class InstagramProfileApi extends InstagramApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }

    async fetchProfile(id) {
        return this.get(`/${id}`, {
            fields: "name,username,profile_pic",
            access_token: this.accessToken,
        });
    }

    async fetchOwnerProfile() {
        return this.get(`/me`, {
            fields: "id,profile_picture_url,username,name,user_id",
            access_token: this.accessToken,
        });
    }


};

module.exports = InstagramProfileApi;