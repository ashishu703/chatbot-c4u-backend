
const InstagramAccountRepository = require("../../repositories/InstagramAccountRepository");
const InstagramService = require("./InstagramService");


module.exports = class InstagramProfileService extends InstagramService {
    page;
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }


    async fetchProfileByMessage(messageId) {
        return this.get(`/${messageId}`, {
            fields: 'id,created_time,from,to,message',
            access_token: this.accessToken
        });
    }



    async fetchAndSaveProfile(accountId) {
        const {
            id,
            name,
            avatar
        } = await this.get(`/${accountId}`, {
            fields: 'id,profile_picture_url,username,name',
            access_token: this.accessToken
        });

        return this.saveProfile(accountId, name, avatar);
    }


    async saveProfile(accountId, name, avatar) {
        return InstagramAccountRepository.updateOrCreate(this.user.uid, accountId, name, avatar, this.accessToken);
    }




}