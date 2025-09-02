const { WHATSAPP } = require("../../types/social-platform-types");
const WhatsappApi = require("./WhatsappApi");
class WhatsappTemplateApi extends WhatsappApi {
    constructor(user = null, accessToken = null, wabaId = null) {
        super(user, accessToken, wabaId);
    }

    async createTemplete(body) {
        return this.post(`/${this.wabaId}/message_templates`, body);
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
        const payload = {
            messaging_product: WHATSAPP,
            to: senderId,
            type: "template",
            template,
        };



        try {
            const response = await this.post(`/${this.wabaId}/messages`, payload);
            console.log("response", response);
            return response;
        } catch (error) {

            throw error;
        }
    }

    async getTemplete(templateName) {
        return this.get(`/${this.wabaId}/message_templates`, {
            name: templateName,
        });
    }
}
module.exports = WhatsappTemplateApi;
