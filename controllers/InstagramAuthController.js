const InstagramAuthService = require("../services/InstagramAuthService");
const InstagramProfileService = require("../services/InstagramProfileService");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");

class InstagramAuthController  {
  async initiateUserAuth(req, res, next) {
    try {
      console.log('🚀 InstagramAuthController.initiateUserAuth started');
      console.log('🔍 Request body:', {
        hasCode: !!req.body.code,
        hasRedirectUri: !!req.body.redirect_uri,
        redirectUri: req.body.redirect_uri
      });
      console.log('🔍 User from middleware:', {
        uid: req.decode?.uid,
        role: req.decode?.role,
        name: req.decode?.name
      });
      
      const { code, redirect_uri } = req.body;
      const user = req.decode;
      
      if (!user || !user.uid) {
        console.error('❌ No user found in request');
        return res.status(401).json({ success: false, message: 'User not authenticated' });
      }
      
      const authService = new InstagramAuthService(user, null);
      const result = await authService.initiateUserAuth(code, redirect_uri);
      
      console.log('✅ InstagramAuthController.initiateUserAuth completed successfully');
      return formSuccess(res,{ msg: __t("success") });
    } catch (err) {
      console.error('❌ InstagramAuthController.initiateUserAuth failed:', {
        message: err.message,
        stack: err.stack,
        name: err.name
      });
      next(err);
    }
  }

 
  async getAccounts(req, res, next) {
    try {
      const user = req.decode;
      const profileService = new InstagramProfileService(user, null);
      const profiles = await profileService.getProfiles(user.uid);
      return formSuccess(res,{ msg: __t("success"), profiles });
    } catch (err) {
      next(err);
    }
  }

  async deleteAccount(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.decode;
      const profileService = new InstagramProfileService(user, null);
      await profileService.deleteProfile(id);
      return formSuccess(res,{ msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }
};
module.exports = InstagramAuthController