const WebPublicRepository = require("../repositories/WebPublicRepository");
const WhatsappAuthService = require("../services/WhatsappAuthService");
const WhatsappProfileService = require("../services/WhatsappProfileService");
const { formSuccess } = require("../utils/response.utils");

class MessangerAuthController {
    constructor() {
        this.webPublicRepository = new WebPublicRepository();
    }
    async initiateUserAuth(req, res, next) {
        try {
            const {
                code,
                business_id,
                waba_id
            } = req.body


            const user = req.decode;
            const authService = new WhatsappAuthService(user);
            const accountInfo = await authService.initiateUserAuth(
                code,
                business_id,
                waba_id
            );
            if (!accountInfo) throw new Error("Authentication Failed");
            return formSuccess(res, { msg: "success" });
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

            return formSuccess(res, {
                msg: "success",
                profiles
            });
        }
        catch (err) {
            next(err);
        }
    }


    async getAuthParams(req, res, next) {
        try {
            const {
                whatsapp_client_id,
                whatsapp_config_id,
                whatsapp_graph_version
            } = await this.webPublicRepository.getWebPublic();

            return formSuccess(res, {
                msg: "success",
                clientId: whatsapp_client_id,
                whatsapp_config_id: whatsapp_config_id,
                version: whatsapp_graph_version
            });
        } catch (err) {
            next(err);
        }
    }



    async deleteAccount(req, res, next) {
        try {
            const { wabaId } = req.params;
            const user = req.decode;
            const profileService = new WhatsappProfileService(user, null);
            await profileService.deleteProfile(wabaId);
            return formSuccess(res, { msg: "success" });
        }
        catch (err) {
            next(err);
        }
    }
}

module.exports = MessangerAuthController;