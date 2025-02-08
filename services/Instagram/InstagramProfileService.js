
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
            user_id: instagramUserId,
            name,
            username,
            avatar
        } = await this.get(`/${accountId}`, {
            fields: 'id,profile_picture_url,username,name,user_id',
            access_token: this.accessToken
        });

        return this.saveProfile(accountId, name, avatar, username, instagramUserId);
    }


    async saveProfile(accountId, name, avatar, username, instagramUserId) {
        return InstagramAccountRepository.updateOrCreate(this.user.uid, instagramUserId, accountId, name, username, avatar, this.accessToken);
    }

    async getProfiles(){
        return InstagramAccountRepository.findManyByUserId(this.user.uid);
    }


    async deleteProfile(id) {
        return InstagramAccountRepository.deleteByAccountId(id);
    }


}