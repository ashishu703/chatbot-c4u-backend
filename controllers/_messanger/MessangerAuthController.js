const FacebookException = require("../../exceptions/FacebookException");
const WebPublicRepository = require("../../repositories/WebPublicRepository");
const FacebookProfileService = require("../../services/_messanger/FacebookProfileService");
const MessangerAuthService = require("../../services/_messanger/MessangerAuthService");
const MessangerPageService = require("../../services/_messanger/MessangerPageService");
const MessangerController = require("./MessangerController");

module.exports = class MessangerAuthController extends MessangerController {
    async initiateUserAuth(req, res) {
        try {
            const { accessToken } = req.body
            const user = req.decode;
            const authService = new MessangerAuthService(user, accessToken);
            await authService.initMeta();
            const accountInfo = await authService.initiateUserAuth();
            if (!accountInfo) throw new Error("Authentication Failed");
            const pageService = new MessangerPageService(user, accountInfo.accessToken)
            await pageService.initMeta();
            await pageService.fetchAndSavePages(accountInfo.accountId);
            res.status(200).json({ msg: "success" });
        }
        catch (err) {
            console.log(err);
            if (err instanceof FacebookException) {
                return res.status(400).json(err);
            }
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }

    async getAccounts(req, res) {
        try {
            const user = req.decode;
            const profileService = new FacebookProfileService(user, null);
            const profiles = await profileService.getProfiles();
            res.status(200).json({ msg: "success", profiles });
        }
        catch (err) {
            console.log(err);
            if (err instanceof FacebookException) {
                return res.status(400).json(err);
            }
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }


    async getAuthParams(req, res) {
        try {
            const {
                facebook_client_id,
                facebook_auth_scopes,
                facebook_graph_version
            } = await WebPublicRepository.getSetting();

            res.status(200).json({
                msg: "success",
                clientId: facebook_client_id,
                scopes: facebook_auth_scopes,
                version: facebook_graph_version
            });
        } catch (err) {
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }



    async deleteAccount(req, res) {
        try {
            const { id } = req.params;
            const user = req.decode;
            const profileService = new FacebookProfileService(user, null);
            await profileService.deleteProfile(id);
            res.status(200).json({ msg: "success" });
        }
        catch (err) {
            console.log(err);
            if (err instanceof FacebookException) {
                return res.status(400).json(err);
            }
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }
}