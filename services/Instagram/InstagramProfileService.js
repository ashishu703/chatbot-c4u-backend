const FacebookPageRepository = require("../../repositories/FacebookPageRepository");
const InstagramService = require("./InstagramService");


module.exports = class InstagramProfileService extends InstagramService {
    page;
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }


    async fetchProfile(messageId) {  
        return this.get(`/${messageId}`, {
            fields: 'id,created_time,from,to,message',
            access_token: this.accessToken
        });
    }

    
}