const FacebookException = require("../exceptions/FacebookException");
const WebPublicRepository = require("../repositories/WebPublicRepository");
const FacebookProfileService = require("../services/FacebookProfileService");
const MessangerAuthService = require("../services/MessangerAuthService");
const MessangerPageService = require("../services/MessangerPageService");
const { formSuccess } = require("../utils/response.utils");
const MessangerController = require("../controllers/MessangerController");
const AuthenticationFailedException = require("../exceptions/CustomExceptions/AuthenticationFailedException");

module.exports = class MessangerAuthController extends MessangerController {
  async initiateUserAuth(req, res, next) {
    try {
      const { accessToken } = req.body;
      const user = req.decode;
      const authService = new MessangerAuthService(user, accessToken);
      await authService.initMeta();
      const accountInfo = await authService.initiateUserAuth();
      if (!accountInfo) throw new AuthenticationFailedException();
      const pageService = new MessangerPageService(
        user,
        accountInfo.accessToken
      );
      await pageService.initMeta();
      await pageService.fetchAndSavePages(accountInfo.accountId);
      return formSuccess({ msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }

  async getAccounts(req, res, next) {
    try {
      const user = req.decode;
      const profileService = new FacebookProfileService(user, null);
      const profiles = await profileService.getProfiles();
      return formSuccess({ msg: __t("success"), profiles });
    } catch (err) {
      next(err);
    }
  }

  async getAuthParams(req, res, next) {
    try {
      const {
        facebook_client_id,
        facebook_auth_scopes,
        facebook_graph_version,
      } = await WebPublicRepository.getSetting();

      return formSuccess({
        msg: __t("success"),
        clientId: facebook_client_id,
        scopes: facebook_auth_scopes,
        version: facebook_graph_version,
      });
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
      return formSuccess({ msg: __t("success") });
    } catch (err) {
      next(err);
    }
  }
};
