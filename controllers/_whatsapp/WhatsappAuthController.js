const FacebookException = require("../../exceptions/FacebookException");
const WebPublicRepository = require("../../repositories/WebPublicRepository");
const WhatsappAuthService = require("../../services/_whatsapp/WhatsappAuthService");
const WhatsappController = require("./WhatsappController");

module.exports = class MessangerAuthController extends WhatsappController {
    async initiateUserAuth(req, res) {
        try {
            const {
                code,
                phone_number_id,
                waba_id
            } = req.body

            
            const user = req.decode;
            const authService = new WhatsappAuthService(user);
            await authService.initMeta();
            const accountInfo = await authService.initiateUserAuth(
                code,
                phone_number_id,
                waba_id
            );
            if (!accountInfo) throw new Error("Authentication Failed");
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