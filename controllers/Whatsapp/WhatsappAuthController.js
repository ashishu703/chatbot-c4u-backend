const WebPublicRepository = require("../../repositories/WebPublicRepository");
const MessangerAuthService = require("../../services/Messanger/MessangerAuthService");
const WhatsappController = require("./WhatsappController");

module.exports = class MessangerAuthController extends WhatsappController {
    // async initiateUserAuth(req, res) {
    //     try {
    //         const { accessToken } = req.body
    //         const user = req.decode;
    //         const authService = new MessangerAuthService(user, accessToken);
    //         await authService.init();
    //         const accountInfo = await authService.initiateUserAuth();
    //         if (!accountInfo) throw new Error("Authentication Failed");
    //         const pageService = new MessangerPageService(user, accountInfo.accessToken)
    //         await pageService.init();
    //         await pageService.fetchAndSavePages(accountInfo.accountId);
    //         res.status(200).json({ msg: "success" });
    //     }
    //     catch (err) {
    //         console.log(err);
    //         if (err instanceof FacebookException) {
    //             return res.status(400).json(err);
    //         }
    //         return res.status(500).json({ msg: "something went wrong", err });
    //     }
    // }

    // async getAccounts(req, res) {
    //     try {
    //         const user = req.decode;
    //         const profileService = new FacebookProfileService(user, null);
    //         const profiles = await profileService.getProfiles();
    //         res.status(200).json({ msg: "success", profiles });
    //     }
    //     catch (err) {
    //         console.log(err);
    //         if (err instanceof FacebookException) {
    //             return res.status(400).json(err);
    //         }
    //         return res.status(500).json({ msg: "something went wrong", err });
    //     }
    // }


    async getAuthParams(req, res) {
        try {
            const {
                whatsapp_client_id,
                whatsapp_auth_scopes,
                whatsapp_graph_version
            } = await WebPublicRepository.getSetting();

            res.status(200).json({
                msg: "success",
                clientId: whatsapp_client_id,
                scopes: whatsapp_auth_scopes,
                version: whatsapp_graph_version
            });
        } catch (err) {
            return res.status(500).json({ msg: "something went wrong", err });
        }
    }



    // async deleteAccount(req, res) {
    //     try {
    //         const { id } = req.params;
    //         const user = req.decode;
    //         const profileService = new FacebookProfileService(user, null);
    //         await profileService.deleteProfile(id);
    //         res.status(200).json({ msg: "success" });
    //     }
    //     catch (err) {
    //         console.log(err);
    //         if (err instanceof FacebookException) {
    //             return res.status(400).json(err);
    //         }
    //         return res.status(500).json({ msg: "something went wrong", err });
    //     }
    // }
}