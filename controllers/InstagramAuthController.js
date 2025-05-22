const FacebookException = require("../exceptions/FacebookException");
const InstagramAuthService = require("../services/_instagram/InstagramAuthService");
const InstagramProfileService = require("../services/_instagram/InstagramProfileService");
const { formSuccess } = require("../utils/response.utils");
const InstagramController = require("./InstagramController");
const { __t } = require("../utils/locale.utils");

module.exports = class InstagramAuthController extends InstagramController {
  async initiateUserAuth(req, res, next) {
    try {
      const { code } = req.body;
      const user = req.decode;
      const authService = new InstagramAuthService(user, null);
      await authService.initMeta();
      await authService.initiateUserAuth(code);
      return formSuccess({ msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }

  async getAuthUri(req, res, next) {
    try {
      const authService = new InstagramAuthService(null, null);
      await authService.initMeta();
      const authURI = authService.prepareAuthUri();
      return formSuccess({ msg: __t("success"), authURI });
    } catch (err) {
      next(err);
    }
  }

  async getAccounts(req, res, next) {
    try {
      const user = req.decode;
      const profileService = new InstagramProfileService(user, null);
      const profiles = await profileService.getProfiles();
      return formSuccess({ msg: __t("success"), profiles });
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
      return formSuccess({ msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }
};
