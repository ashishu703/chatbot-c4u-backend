const InstagramAuthApi = require("../api/Instagram/InstagramAuthApi");
const SocialAccountRepository = require("../repositories/SocialAccountRepository");

class InstagramAuthService {

  constructor(user, accessToken) {
    this.user = user;
    this.instagramAuthApi = new InstagramAuthApi(user, accessToken);
    this.socialAccountRepository = new SocialAccountRepository();
  }

  async initiateUserAuth(code, redirectUri) {
    try {
      console.log('🚀 InstagramAuthService.initiateUserAuth started:', {
        hasCode: !!code,
        hasRedirectUri: !!redirectUri,
        redirectUri
      });
      
      await this.instagramAuthApi.initMeta();
      if (redirectUri) this.instagramAuthApi.redirectUri = redirectUri;
      
      console.log('🔍 InstagramAuthService - after initMeta:', {
        appId: this.instagramAuthApi.AppId ? '***' : 'missing',
        appSecret: this.instagramAuthApi.AppSecret ? '***' : 'missing',
        redirectUri: this.instagramAuthApi.redirectUri,
        oauthGraphVersion: this.instagramAuthApi.oauthGraphVersion
      });
      
      const token = await this.getToken(code, redirectUri);
      console.log('✅ InstagramAuthService - token obtained:', !!token);
      
      await this.subscribeWebhook();
      console.log('✅ InstagramAuthService - webhook subscribed');
      
      const result = await this.saveCurrentSession(token);
      console.log('✅ InstagramAuthService - session saved:', !!result);
      
      return result;
    } catch (error) {
      console.error('❌ InstagramAuthService.initiateUserAuth failed:', {
        message: error.message,
        stack: error.stack,
        code: !!code,
        redirectUri
      });
      throw error;
    }
  }

  async getToken(code, redirectUri) {
    try {
      console.log('🔍 InstagramAuthService.getToken - starting with code:', !!code);
      
      const { access_token: shortLiveToken } = await this.instagramAuthApi.authorizeAuthCode(code, redirectUri);
      console.log('✅ Short-lived token obtained:', !!shortLiveToken);
      
      const { access_token: longLiveToken } = await this.instagramAuthApi.setToken(shortLiveToken).getLongLiveToken();
      console.log('✅ Long-lived token obtained:', !!longLiveToken);
      
      return longLiveToken;
    } catch (error) {
      console.error('❌ InstagramAuthService.getToken failed:', {
        message: error.message,
        stack: error.stack,
        code: !!code,
        redirectUri
      });
      throw error;
    }
  }

  async subscribeWebhook() {
    try {
      // Ensure we subscribe to the correct IG business account
      const profile = await this.instagramAuthApi.fetchOwnerProfile();
      if (profile && profile.id) {
        console.log('🔍 Subscribing to webhook for IG account:', profile.id);
        const result = await this.instagramAuthApi.subscribeWebhook(profile.id);
        console.log('✅ Webhook subscription result:', result);
        return result;
      }
      console.log('⚠️ No IG profile found, skipping webhook subscription');
      return true;
    } catch (error) {
      console.error('❌ InstagramAuthService.subscribeWebhook failed:', {
        message: error.message,
        stack: error.stack
      });
      // Don't throw - webhook subscription is not critical for auth
      return false;
    }
  }

  async saveCurrentSession(token) {
    try {
      console.log('🔍 InstagramAuthService.saveCurrentSession - starting with token:', !!token);
      
      const profile = await this.instagramAuthApi.fetchOwnerProfile();
      console.log('✅ Profile fetched:', {
        id: profile.id,
        username: profile.username,
        name: profile.name
      });

      const {
        id, profile_picture_url, username, name, user_id
      } = profile;

      const result = await this.socialAccountRepository.updateOrCreateInstagramProfile(
        id,
        this.user.uid,
        profile_picture_url,
        username,
        name,
        user_id,
        token
      );
      
      console.log('✅ Instagram profile saved to database:', !!result);
      return result;
    } catch (error) {
      console.error('❌ InstagramAuthService.saveCurrentSession failed:', {
        message: error.message,
        stack: error.stack,
        hasToken: !!token,
        userId: this.user?.uid
      });
      throw error;
    }
  }

};

module.exports = InstagramAuthService;