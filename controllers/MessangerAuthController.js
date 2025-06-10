const WebPublicRepository = require("../repositories/WebPublicRepository");
const FacebookProfileService = require("../services/FacebookProfileService");
const MessangerAuthService = require("../services/MessangerAuthService");
const MessangerPageService = require("../services/MessangerPageService");
const { formSuccess } = require("../utils/response.utils");
const AuthenticationFailedException = require("../exceptions/CustomExceptions/AuthenticationFailedException");
const { __t } = require("../utils/locale.utils");

class MessangerAuthController  {
  constructor() {
    this.webPublicRepository = new WebPublicRepository();
  }
  async initiateUserAuth(req, res, next) {
    try {
      const { accessToken } = req.body;
      const user = req.decode;
      const authService = new MessangerAuthService(user, accessToken);
      const accountInfo = await authService.initiateUserAuth();
      if (!accountInfo) throw new AuthenticationFailedException();
      const pageService = new MessangerPageService(
        user,
        accountInfo.token
      );

      await pageService.fetchAndSavePages(accountInfo.id);
      return formSuccess(res,{ msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }

  async getAccounts(req, res, next) {
    try {
      const user = req.decode;
      const profileService = new FacebookProfileService(user, null);
      const profiles = await profileService.getProfiles();
      return formSuccess(res,{ msg: __t("success"), profiles });
    } catch (err) {
      next(err);
    }
  }


  async deleteAccount(req, res, next) {
    try {
      const { id } = req.params;
      const user = req.decode;
      const profileService = new FacebookProfileService(user, null);
      await profileService.deleteProfile(id);
      return formSuccess(res,{ msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }
};

module.exports = MessangerAuthController