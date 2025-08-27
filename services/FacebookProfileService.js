const ChatRepository = require("../repositories/ChatRepository");
const MessengerProfileApi = require("../api/Messanger/MessengerProfileApi");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const { MESSANGER } = require("../types/social-platform-types");
class FacebookProfileService {
  constructor(user, accessToken) {
    this.user = user;
    this.accessToken = accessToken;
    this.messangerProfileApi = new MessengerProfileApi(user, accessToken);
    this.socialAccountRepository = new SocialAccountRepository();
    this.chatRepository = new ChatRepository();
  }

  async fetchAndSaveProfileInformation() {
    const { id, name } = await this.fetchProfile();
    return this.saveProfile(id, name);
  }

  async saveProfile(accountId, name) {
    return this.socialAccountRepository.updateOrCreate(
      {
        uid: this.user.uid,
        account_id: accountId,
        name: name,
        access_token: this.accessToken
      }
    );
  }

  async fetchProfile() {
    return this.messangerProfileApi.fetchOwnerProfile();
  }

  async getProfiles() {
    return this.socialAccountRepository.findManyByUserId(this.user.uid);
  }

  async deleteProfile(id) {
    return this.socialAccountRepository.deleteByAccountId(id);
  }
};


module.exports = FacebookProfileService