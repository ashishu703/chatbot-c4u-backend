const AiIntegrationService = require("../services/AiIntegrationService");
const { formSuccess, formError } = require("../utils/response.utils");

class AiIntegrationController {
  constructor() {
    this.aiIntegrationService = new AiIntegrationService();
  }

  async create(req, res, next) {
    try {
      const userId = req.user.id;
      const { apiKey, provider, model, temperature } = req.body;

      if (!apiKey) {
        return formError(res, "API key is required", 400);
      }

      const integration = await this.aiIntegrationService.createIntegration(userId, {
        apiKey,
        provider,
        model,
        temperature,
      });

      return formSuccess(res, {
        integration,
        message: "AI integration created successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  async update(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { apiKey, provider, model, temperature, isActive } = req.body;

      const integration = await this.aiIntegrationService.updateIntegration(userId, id, {
        apiKey,
        provider,
        model,
        temperature,
        isActive,
      });

      return formSuccess(res, {
        integration,
        message: "AI integration updated successfully",
      });
    } catch (error) {
      if (error.message === "AI integration not found") {
        return formError(res, "AI integration not found", 404);
      }
      next(error);
    }
  }

  async getAll(req, res, next) {
    try {
      const userId = req.user.id;
      const integrations = await this.aiIntegrationService.getIntegrations(userId);

      return formSuccess(res, {
        integrations,
        count: integrations.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getActive(req, res, next) {
    try {
      const userId = req.user.id;
      const integration = await this.aiIntegrationService.getActiveIntegration(userId);

      return formSuccess(res, {
        integration,
      });
    } catch (error) {
      next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await this.aiIntegrationService.deleteIntegration(userId, id);

      return formSuccess(res, {
        message: "AI integration deleted successfully",
      });
    } catch (error) {
      if (error.message === "AI integration not found") {
        return formError(res, "AI integration not found", 404);
      }
      next(error);
    }
  }


}

module.exports = AiIntegrationController;
