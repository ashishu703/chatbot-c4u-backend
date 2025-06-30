const WhatsappTemplateApi = require("../api/Whatsapp/WhatsappTemplateApi");

class WhatsappTemplateService {
    constructor(
        user = null,
        accessToken = null,
        wabaId = null
    ) {
        this.whatsappTemplateApi = new WhatsappTemplateApi(user, accessToken, wabaId);
    }




    async addTemplate(body) {
        await this.whatsappTemplateApi.initMeta();
        return this.whatsappTemplateApi.createTemplete(body);
    }

    async getTemplates() {
        await this.whatsappTemplateApi.initMeta();
        return this.whatsappTemplateApi.getTempletes();
    }


    async deleteTemplates(name) {
        await this.whatsappTemplateApi.initMeta();
        return this.whatsappTemplateApi.deleteTemplate(name);
    }
}

module.exports = WhatsappTemplateService;