const { INSTAGRAM } = require("../types/social-platform-types");
const SocialAccountRepository = require("./../repositories/SocialAccountRepository");

class InstagramProfileService {
  constructor() {
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async getProfiles(userId) {
    return this.socialAccountRepository.find({
      where: {
        uid: userId,
        platform: INSTAGRAM
      }
    });
  }

  async deleteProfile(id) {
    return this.socialAccountRepository.deleteByAccountId(id);
  }
};
module.exports = InstagramProfileService