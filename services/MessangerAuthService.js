const FacebookProfileService = require("./FacebookProfileService");
const MessengerAuthApi = require("../api/Messanger/MessengerAuthApi");
const MessengerProfileApi = require("../api/Messanger/MessengerProfileApi");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");
class MessangerAuthService {
  constructor(user, accessToken) {
    this.user = user;
    this.authApi = new MessengerAuthApi(user, accessToken);
    this.profileApi = new MessengerProfileApi(user, accessToken);
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async initiateUserAuth() {
    await this.authApi.initMeta();
    const {
      access_token: accessToken
    } = await this.authApi.getLongLiveToken();
    return this.saveCurrentSession(accessToken, this.authApi.getToken());
  }


  async saveCurrentSession(token, refreshToken) {
    await this.profileApi.initMeta();
    const profile = await this.profileApi.fetchOwnerProfile()
    const {
      id, picture: pictureObject, name, short_name: username
    } = profile;

    const picture = pictureObject?.data?.url || "";

    return this.socialAccountRepository.updateOrCreateFacebookProfile(
      this.user.uid,
      id,
      username,
      name,
      picture,
      token,
      refreshToken
    );
  }
};
module.exports = MessangerAuthService