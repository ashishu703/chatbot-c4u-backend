const { whatsAppAccountPin, backendURI } = require("../../config/app.config");
const WhatsappApi = require("./WhatsappApi");

class WhatsappAuthApi extends WhatsappApi {
    constructor(user = null, accessToken = null) {
        super(user, accessToken);
    }


    async getLongLiveToken(code, redirectUri = null) {
        console.log("[WhatsappAuthApi] getLongLiveToken", { wabaId: this.wabaId, hasCode: !!code, hasRedirect: !!redirectUri, redirectUri });
        return this.get("/oauth/access_token", {
            client_id: this.AppId,
            client_secret: this.AppSecret,
            grant_type: "authorization_code",
            code: code,
            ...(redirectUri ? { redirect_uri: redirectUri } : {}),
        });
    }


    async registerAccount(phoneNumberId) {
        console.log("[WhatsappAuthApi] registerAccount", { wabaId: this.wabaId, phoneNumberId });
        return this.post(`/${phoneNumberId}/register`, {
            messaging_product: "whatsapp",
            pin: whatsAppAccountPin,
        });
    }

    async getOwnerProfile() {
        console.log("getOwnerProfile", this.wabaId);
        return this.get("/me");
    }

    async getNumberInfo(phoneNoId) {
        console.log("getNumberInfo", this.wabaId);
        return this.get(`/${phoneNoId}`);
    }

    async getBusinesses() {
        console.log("getBusinesses");
        return this.get(`/me/businesses`, { 
            fields: "id,name,verification_status",
            limit: 100 
        });
    }

    async getWabasForBusiness(businessId) {
        console.log("getWabasForBusiness", { businessId });
        return this.get(`/${businessId}/owned_whatsapp_business_accounts`, { 
            fields: "id,name,account_review_status,business_verification_status",
            limit: 100 
        });
    }

    async getPhoneNumbersForWaba(wabaId) {
        console.log("getPhoneNumbersForWaba", { wabaId });
        return this.get(`/${wabaId}/phone_numbers`, { 
            fields: "id,display_phone_number,verified_name,code_verification_status,name_status,quality_rating,status",
            limit: 100 
        });
    }

    // Alternative method - try to get WABAs directly from me endpoint
    async getMyWhatsappBusinessAccounts() {
        console.log("getMyWhatsappBusinessAccounts - trying direct approach");
        return this.get(`/me/whatsapp_business_accounts`, { 
            fields: "id,name,account_review_status,business_verification_status",
            limit: 100 
        });
    }

    // Get all accessible pages (sometimes WABA is linked to a page)
    async getMyPages() {
        console.log("getMyPages");
        return this.get(`/me/accounts`, { 
            fields: "id,name,access_token,whatsapp_business_account_id",
            limit: 100 
        });
    }


    async subscribeWebhook(wabaId) {
        // Always prefer the provided wabaId; fallback to internal state
        const effectiveWabaId = wabaId || this.wabaId;
        console.log("[WhatsappAuthApi] subscribeWebhook", { wabaId: effectiveWabaId });
        const baseFromEnv = backendURI || process.env.BACKURI || process.env.BACKEND_URI || process.env.BACKEND_URL || process.env.BASE_URL || "http://localhost:4500";
        const normalizedBase = (baseFromEnv || "").replace(/\/$/, "");
        const callbackUri = `${normalizedBase}/api/whatsapp/webhook`;
        return this.post(`/${effectiveWabaId}/subscribed_apps`, {
            override_callback_uri: callbackUri,
            verify_token: this.webhookVerificationToken,
        });
    }

    async unsubscribeWebhook(wabaId) {
        console.log("unsubscribeWebhook", this.wabaId);
        return this.post(`/${wabaId}/subscribed_apps`, {});
    }
};

module.exports = WhatsappAuthApi
