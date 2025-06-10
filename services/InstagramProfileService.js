const SocialAccountRepository = require("./../repositories/SocialAccountRepository");

class InstagramProfileService {
  constructor() {
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async getProfiles(userId) {
    return this.socialAccountRepository.findManyByUserId(userId);
  }

  async deleteProfile(id) {
    return this.socialAccountRepository.deleteByAccountId(id);
  }
};
module.exports = InstagramProfileService