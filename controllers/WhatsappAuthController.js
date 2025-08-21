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
                phone_number_id,
                waba_id,
                business_id,
                redirect_uri
            } = req.body

            // accept business_id as alias for phone_number_id from some frontends
            const phoneNumberId = phone_number_id || business_id;

            console.log("[WhatsappAuthController] initiateUserAuth payload", {
                hasCode: !!code,
                waba_id,
                phone_number_id: phone_number_id || null,
                business_id: business_id || null,
                phoneNumberId,
                redirect_uri
            });

            const user = req.decode;
            console.log("[WhatsappAuthController] user info", { uid: user?.uid, role: user?.role, email: user?.email });
            const authService = new WhatsappAuthService(user);
            console.log("[WhatsappAuthController] invoking WhatsappAuthService.initiateUserAuth");
            const accountInfo = await authService.initiateUserAuth(
                code,
                phoneNumberId,
                waba_id,
                redirect_uri
            );
            if (!accountInfo) throw new Error("Authentication Failed");
            console.log("[WhatsappAuthController] account saved", accountInfo?.id || accountInfo);
            return formSuccess(res, { msg: "success", data: accountInfo });
        }
        catch (err) {
            console.error("[WhatsappAuthController] initiateUserAuth error", err?.message, err?.response?.data, err?.stack);
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