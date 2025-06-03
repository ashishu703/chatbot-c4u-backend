const FacebookProfileService = require("./FacebookProfileService");
const MessengerAuthApi = require("../api/Messanger/MessengerAuthApi");
const MessengerProfileApi = require("../api/Messanger/MessengerProfileApi");
class MessangerAuthService {
  constructor(user, accessToken) {
    this.authApi = new MessengerAuthApi(user, accessToken);
    this.profileApi = new MessengerProfileApi(user, accessToken);
  }

  async initiateUserAuth() {
    const {
      access_token
    } = await this.authApi.getLongLiveToken();
    return this.saveCurrentSession(access_token);
  }

  async getLongLiveToken() {
    const response = await this.get("/oauth/access_token", {
      client_id: this.AppId,
      client_secret: this.AppSecret,
      grant_type: "fb_exchange_token",
      fb_exchange_token: this.accessToken,
    });

    const { access_token } = response;

    this.accessToken = access_token;

    return access_token;
  }

  async saveCurrentSession(token) {
    const profile = await this.profileApi
      .initMeta()
      .setToken(token)
      .fetchOwnerProfile();

    const {
      id, profile_picture_url, username, name, user_id
    } = profile;

    return this.socialAccountRepository.updateOrCreateFacebookProfile(
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
module.exports = MessangerAuthService