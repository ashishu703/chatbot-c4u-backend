const { WHATSAPP } = require("../../types/social-platform-types");
const WhatsappApi = require("./WhatsappApi");
class WhatsappTemplateApi extends WhatsappApi {
    constructor(user = null, accessToken = null, wabaId = null) {
        super(user, accessToken, wabaId);
    }

    async createTemplete(body) {
        return this.post(`/${this.wabaId}/message_templates`, JSON.stringify(body));
    }

    async getTempletes() {
        return this.get(`/${this.wabaId}/message_templates`);
    }

    async deleteTemplate(name) {
        return this.delete(`/${this.wabaId}/message_templates`, {
            name,
        });
    };

    async sendTemplate(senderId, template) {
        return this.post(`/${this.wabaId}/messages`, {
            messaging_product: WHATSAPP,
            to: senderId,
            type: "template",
            template,
        });
    }

    async getTemplete(templateName) {
        return this.get(`/${this.wabaId}/message_templates`, {
            name: templateName,
        });
    }
}
module.exports = WhatsappTemplateApi;
