const InstagramAuthApi = require("../api/Instagram/InstagramAuthApi");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");

class InstagramAuthService {

  constructor(user, accessToken) {
    this.user = user;
    this.instagramAuthApi = new InstagramAuthApi(user, accessToken);
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async initiateUserAuth(code) {
    await this.instagramAuthApi.initMeta();
    const token = await this.getToken(code);
    await this.subscribeWebhook();
    return this.saveCurrentSession(token);
  }

  async getToken(code) {
    const { access_token: shortLiveToken } = await this.instagramAuthApi.authorizeAuthCode(code);

    const { access_token: longLiveToken } = await this.instagramAuthApi.setToken(shortLiveToken).getLongLiveToken();
    return longLiveToken;
  }

  async subscribeWebhook() {
    return this.instagramAuthApi.subscribeWebhook();
  }

  async saveCurrentSession(token) {
    const profile = await this.instagramAuthApi.fetchOwnerProfile();

    const {
      id, profile_picture_url, username, name, user_id
    } = profile;

    return this.socialAccountRepository.updateOrCreateInstagramProfile(
      id,
      this.user.uid,
      profile_picture_url,
      username,
      name,
      user_id,
      token
    );
  }

};

module.exports = InstagramAuthService;