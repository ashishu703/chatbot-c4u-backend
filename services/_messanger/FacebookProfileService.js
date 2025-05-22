const ChatRepository = require("../../repositories/chatRepository");
const FacebookProfileRepository = require("../../repositories/FacebookProfileRepository");
const MessangerService = require("./MessangerService");

module.exports = class FacebookProfileService extends MessangerService {
  constructor(user, accessToken) {
    super(user, accessToken);
  }

  async fetchAndSaveProfileInformation() {
    const { id, name } = await this.fetchProfile();
    return this.saveProfile(id, name);
  }

  async saveProfile(accountId, name) {
    await FacebookProfileRepository.updateOrCreate(
      this.user.uid,
      accountId,
      name,
      this.accessToken
    );
    return {
      userId: this.user.uid,
      accountId,
      name,
      accessToken: this.accessToken,
    };
  }

  async fetchProfile() {
    return this.get("/me", {
      access_token: this.accessToken,
    });
  }

  async getProfiles() {
    return FacebookProfileRepository.findManyByUserId(this.user.uid);
  }

  async deleteProfile(id) {
    await ChatRepository.removePlatformChat(this.user.uid, "MESSENGER");
    return FacebookProfileRepository.deleteByAccountId(id);
  }
};
