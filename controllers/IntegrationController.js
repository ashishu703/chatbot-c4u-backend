const IntegrationService = require("../services/IntegrationService");
const { formSuccess, formError } = require("../utils/response.utils");

class IntegrationController {
  constructor() {
    this.integrationService = new IntegrationService();
  }

  async connect(req, res, next) {
    try {
      const userId = req.user.id;
      const { type, name, credentials, settings, webhookUrl, webhookSecret } = req.body;

      if (!type) {
        return formError(res, "Integration type is required", 400);
      }

      const validTypes = ["google_sheets", "facebook_lead_ads", "indiamart"];
      if (!validTypes.includes(type)) {
        return formError(res, "Invalid integration type", 400);
      }

      // For Facebook Lead Ads, subscribe to webhook
      if (type === "facebook_lead_ads" && credentials?.pageId && credentials?.pageAccessToken) {
        try {
          await this.integrationService.subscribeToFacebookLeadAds(
            userId,
            credentials.pageId,
            credentials.pageAccessToken
          );
        } catch (error) {
          console.error("Facebook Lead Ads subscription error:", error);
          return formError(res, `Failed to subscribe to Facebook Lead Ads: ${error.message}`, 400);
        }
      }

      const integration = await this.integrationService.createOrUpdateIntegration(userId, type, {
        name,
        credentials,
        settings,
        webhookUrl,
        webhookSecret,
      });

      return formSuccess(res, {
        integration,
        message: "Integration connected successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async disconnect(req, res, next) {
    try {
      const userId = req.user.id;
      const { type } = req.body;

      if (!type) {
        return formError(res, "Integration type is required", 400);
      }

      await this.integrationService.disconnectIntegration(userId, type);

      return formSuccess(res, {
        message: "Integration disconnected successfully",
      });
    } catch (error) {
      if (error.message === "Integration not found") {
        return formError(res, "Integration not found", 404);
      }
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const integrations = await this.integrationService.getIntegrations(userId);

      return formSuccess(res, {
        integrations,
        count: integrations.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getByType(req, res, next) {
    try {
      const userId = req.user.id;
      const { type } = req.params;

      const integration = await this.integrationService.getIntegrationByType(userId, type);

      if (!integration) {
        return formSuccess(res, {
          integration: null,
          message: "Integration not found",
        });
      }

      return formSuccess(res, {
        integration,
      });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    try {
      const userId = req.user.id;
      const { type, isConnected, errorMessage } = req.body;

      if (!type) {
        return formError(res, "Integration type is required", 400);
      }

      await this.integrationService.updateIntegrationStatus(userId, type, isConnected, errorMessage);

      return formSuccess(res, {
        message: "Integration status updated successfully",
      });
    } catch (error) {
      if (error.message === "Integration not found") {
        return formError(res, "Integration not found", 404);
      }
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { type } = req.query;

      if (!type) {
        return formError(res, "Integration type is required", 400);
      }

      await this.integrationService.deleteIntegration(userId, type);

      return formSuccess(res, {
        message: "Integration deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = IntegrationController;

