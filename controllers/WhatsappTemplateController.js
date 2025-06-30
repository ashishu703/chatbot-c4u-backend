const SocialAccountRepository = require("../repositories/SocialAccountRepository");
const WhatsappTemplateService = require("../services/WhatsappTemplateService");
const { __t } = require("../utils/locale.utils");
const { formSuccess } = require("../utils/response.utils");


class WhatsappTemplateController {
    constructor() {
        this.whatsappTemplateService = new WhatsappTemplateService();
        this.socialAccountRepository = new SocialAccountRepository();
    }


    async addTemplate(req, res, next) {
        try {
            const account = await this.socialAccountRepository.getWhatsappAccount(req.decode.uid);
            await (new WhatsappTemplateService(null, account.token, account.social_account_id)).addTemplate(req.body);
            return formSuccess(res, { msg: __t("template_pending_review") });
        } catch (err) {
            next(err);
        }
    }


    async getTemplates(req, res, next) {
        try {
            const account = await this.socialAccountRepository.getWhatsappAccount(req.decode.uid);
            const result = await (new WhatsappTemplateService(null, account.token, account.social_account_id)).getTemplates();
            return formSuccess(res, result);
        } catch (err) {
            next(err);
        }
    }


    async deleteTemplates(req, res, next) {
        try {
            const { name } = req.body;
            const account = await this.socialAccountRepository.getWhatsappAccount(req.decode.uid);
            await (new WhatsappTemplateService(null, account.token, account.social_account_id)).deleteTemplates(name);
            return formSuccess(res, { msg: __t("template_deleted") });
        } catch (err) {
            next(err);
        }
    }


}

module.exports = WhatsappTemplateController