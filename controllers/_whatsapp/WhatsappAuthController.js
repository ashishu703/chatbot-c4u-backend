const FacebookException = require("../../exceptions/FacebookException");
const WebPublicRepository = require("../../repositories/webPublicRepository");
const WhatsappAuthService = require("../../services/_whatsapp/WhatsappAuthService");
const WhatsappProfileService = require("../../services/_whatsapp/WhatsappProfileService");
const WhatsappController = require("./WhatsappController");

module.exports = class MessangerAuthController extends WhatsappController {
    async initiateUserAuth(req, res, next) {
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
            return formSuccess({ msg: "success" });
        }
        catch (err) {
            next(err);
        }
    }

    async getAccounts(req, res, next) {
        try {
            const user = req.decode;
            const profileService = new WhatsappProfileService(user, null);
            const profiles = await profileService.getProfiles();
            return formSuccess({ msg: "success", profiles });
        }
        catch (err) {
           next(err);
        }
    }


    async getAuthParams(req, res, next) {
        try {
            const {
                whatsapp_client_id,
                config_id,
                whatsapp_graph_version
            } = await WebPublicRepository.getSetting();

            return formSuccess({
                msg: "success",
                clientId: whatsapp_client_id,
                config_id: config_id,
                version: whatsapp_graph_version
            });
        } catch (err) {
           next(err);
        }
    }



    async deleteAccount(req, res, next) {
        try {
            const { id } = req.params;
            const user = req.decode;
            const profileService = new WhatsappProfileService(user, null);
            await profileService.deleteProfile(id);
            return formSuccess({ msg: "success" });
        }
        catch (err) {
           next(err);
        }
    }
}