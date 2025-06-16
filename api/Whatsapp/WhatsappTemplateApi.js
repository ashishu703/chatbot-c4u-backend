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
}
module.exports = WhatsappTemplateApi;
