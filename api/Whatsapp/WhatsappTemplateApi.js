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

        console.log("🌐 [WHATSAPP API] Sending template to Meta API:", {
            url: `/${this.wabaId}/messages`,
            senderId: senderId,
            wabaId: this.wabaId,
            accessToken: this.accessToken ? "***TOKEN_PRESENT***" : "NO_TOKEN",
            template: JSON.stringify(template, null, 2),
            fullPayload: JSON.stringify(payload, null, 2)
        });

        try {
            const response = await this.post(`/${this.wabaId}/messages`, payload);
            console.log("✅ [WHATSAPP API] Meta API response received:", {
                response: response
            });
            return response;
        } catch (error) {
            console.log("❌ [WHATSAPP API] Meta API error:", {
                to: senderId,
                error: error.message,
                status: error.response?.status,
                statusText: error.response?.statusText,
                data: error.response?.data,
                fullError: error
            });
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
