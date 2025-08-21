const AiIntegrationRepository = require("../repositories/AiIntegrationRepository");

class AiIntegrationService {
  constructor() {
    this.aiIntegrationRepository = new AiIntegrationRepository();
  }

  async createIntegration(userId, data) {
    const { apiKey, provider, model, temperature } = data;

    await this.aiIntegrationRepository.updateByUserId(userId, { isActive: false });

    const integration = await this.aiIntegrationRepository.create({
      userId,
      provider: provider || "openai",
      apiKey: apiKey, 
      model: model || "gpt-4o-mini",
      temperature: temperature || 0.7,
      isActive: true,
    });

    return integration;
  }

  async updateIntegration(userId, integrationId, data) {
    const integration = await this.aiIntegrationRepository.findByIdAndUserId(integrationId, userId);
    if (!integration) {
      throw new Error("AI integration not found");
    }

   
    if (data.isActive === true) {
      await this.aiIntegrationRepository.deactivateOthers(userId, integrationId);
    }

    await this.aiIntegrationRepository.update(integrationId, data);
    
    const updatedIntegration = await this.aiIntegrationRepository.findById(integrationId);
    return updatedIntegration;
  }

  async getIntegrations(userId) {
    return await this.aiIntegrationRepository.findByUserId(userId);
  }

  async getActiveIntegration(userId) {
    return await this.aiIntegrationRepository.findActiveByUserId(userId);
  }

  async getIntegrationById(userId, integrationId) {
    const integration = await this.aiIntegrationRepository.findByIdAndUserId(integrationId, userId);
    if (!integration) {
      throw new Error("AI integration not found");
    }
    return integration;
  }

  async deleteIntegration(userId, integrationId) {
    const integration = await this.aiIntegrationRepository.findByIdAndUserId(integrationId, userId);
    if (!integration) {
      throw new Error("AI integration not found");
    }

    await this.aiIntegrationRepository.delete(integrationId);
    return true;
  }


}

module.exports = AiIntegrationService;
