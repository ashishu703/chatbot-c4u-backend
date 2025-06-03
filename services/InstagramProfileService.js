const SocialAccountRepository = require("./../repositories/SocialAccountRepository");

class InstagramProfileService {
  constructor() {
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async getProfiles() {
    return this.socialAccountRepository.findManyByUserId(this.user.uid);
  }

  async deleteProfile(id) {
    return this.socialAccountRepository.deleteByAccountId(id);
  }
};
module.exports = InstagramProfileService