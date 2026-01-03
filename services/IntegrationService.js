const IntegrationRepository = require("../repositories/IntegrationRepository");
const crypto = require("crypto");

class IntegrationService {
  constructor() {
    this.integrationRepository = new IntegrationRepository();
    this.encryptionKey = process.env.ENCRYPTION_KEY || "default-encryption-key-change-in-production";
  }

  // Simple encryption/decryption (use proper encryption in production)
  encrypt(text) {
    if (!text) return null;
    try {
      // For now, just store as JSON string. In production, use proper encryption
      // You can use crypto.createCipheriv with a proper key derivation function
      return JSON.stringify(text);
    } catch (error) {
      console.error("Encryption error:", error);
      return null;
    }
  }

  decrypt(encryptedText) {
    if (!encryptedText) return null;
    try {
      // For now, just parse JSON. In production, decrypt first
      return JSON.parse(encryptedText);
    } catch (error) {
      console.error("Decryption error:", error);
      return null;
    }
  }

  async createOrUpdateIntegration(userId, type, data) {
    const { name, credentials, settings, webhookUrl, webhookSecret } = data;

    // Check if integration already exists
    let integration = await this.integrationRepository.findByUserIdAndType(userId, type);

    const integrationData = {
      userId,
      type,
      name: name || this.getDefaultName(type),
      isConnected: true,
      credentials: credentials ? this.encrypt(credentials) : null,
      settings: settings || {},
      webhookUrl: webhookUrl || null,
      webhookSecret: webhookSecret || null,
      lastSyncAt: new Date(),
      errorMessage: null,
    };

    if (integration) {
      // Update existing integration
      integration = await this.integrationRepository.update(integration.id, integrationData);
    } else {
      // Create new integration
      integration = await this.integrationRepository.create(integrationData);
    }

    return {
      ...integration.toJSON(),
      credentials: credentials, // Return decrypted credentials (be careful in production)
    };
  }

  async disconnectIntegration(userId, type) {
    const integration = await this.integrationRepository.findByUserIdAndType(userId, type);
    if (!integration) {
      throw new Error("Integration not found");
    }

    return await this.integrationRepository.update(integration.id, {
      isConnected: false,
      credentials: null,
      errorMessage: null,
    });
  }

  async getIntegrations(userId) {
    const integrations = await this.integrationRepository.findByUserId(userId);
    return integrations.map((integration) => {
      const data = integration.toJSON();
      // Don't expose encrypted credentials
      if (data.credentials) {
        data.credentials = this.decrypt(data.credentials);
      }
      return data;
    });
  }

  async getIntegrationByType(userId, type) {
    const integration = await this.integrationRepository.findByUserIdAndType(userId, type);
    if (!integration) {
      return null;
    }

    const data = integration.toJSON();
    if (data.credentials) {
      data.credentials = this.decrypt(data.credentials);
    }
    return data;
  }

  async updateIntegrationStatus(userId, type, isConnected, errorMessage = null) {
    const integration = await this.integrationRepository.findByUserIdAndType(userId, type);
    if (!integration) {
      throw new Error("Integration not found");
    }

    const updateData = {
      isConnected,
      errorMessage,
    };

    if (isConnected) {
      updateData.lastSyncAt = new Date();
    }

    return await this.integrationRepository.update(integration.id, updateData);
  }

  async deleteIntegration(userId, type) {
    return await this.integrationRepository.deleteByUserIdAndType(userId, type);
  }

  getDefaultName(type) {
    const names = {
      google_sheets: "Google Sheets Integration",
      facebook_lead_ads: "Facebook Lead Ads Integration",
      indiamart: "IndiaMART Leads Integration",
    };
    return names[type] || "Integration";
  }

  // Facebook Lead Ads specific methods
  async subscribeToFacebookLeadAds(userId, pageId, pageAccessToken) {
    try {
      const graphVersion = "v18.0";
      const url = `https://graph.facebook.com/${graphVersion}/${pageId}/subscribed_apps`;

      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          access_token: pageAccessToken,
          subscribed_fields: "leadgen",
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Failed to subscribe to Facebook Lead Ads: ${errorText}`);
      }

      const result = await response.json();
      return result;
    } catch (error) {
      console.error("Facebook Lead Ads subscription error:", error);
      throw error;
    }
  }
}

module.exports = IntegrationService;

