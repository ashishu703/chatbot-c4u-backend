const DripCampaignService = require("../services/DripCampaignService");
const FillAllFieldsException = require("../exceptions/CustomExceptions/FillAllFieldsException");
const InvalidRequestException = require("../exceptions/CustomExceptions/InvalidRequestException");
const { formSuccess } = require("../utils/response.utils");

class DripCampaignController {
  constructor() {
    this.dripCampaignService = new DripCampaignService();
    this.VALID_STATUSES = ['active', 'paused', 'completed', 'cancelled'];
    this.DEFAULT_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  }

  _validateCampaignId(campaignId) {
    if (!campaignId) {
      throw new InvalidRequestException();
    }
  }

  _validateCampaignData(title, messages) {
    if (!title || !messages || !Array.isArray(messages) || messages.length === 0) {
      throw new FillAllFieldsException();
    }
  }

  _validateStatus(status) {
    if (!status) {
      throw new FillAllFieldsException();
    }
    if (!this.VALID_STATUSES.includes(status)) {
      throw new InvalidRequestException();
    }
  }

  _buildCampaignData(body) {
    const { title, messages } = body;
    
    return {
      title,
      messages
    };
  }

  async _handleRequest(handler, req, res, next) {
    try {
      return await handler(req, res);
    } catch (err) {
      next(err);
    }
  }

  async createCampaign(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const user = req.decode;
      const campaignData = this._buildCampaignData(req.body);
      
      this._validateCampaignData(campaignData.title, campaignData.messages);
      
      const campaign = await this.dripCampaignService.createCampaign(campaignData, user);
      
      return formSuccess(res, { 
        msg: "Campaign created successfully",
        campaign 
      });
    }, req, res, next);
  }

  async getCampaigns(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const user = req.decode;
      const campaigns = await this.dripCampaignService.getCampaigns(user.uid, req.query);
      
      return formSuccess(res, campaigns);
    }, req, res, next);
  }

  async getCampaign(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { campaign_id } = req.params;
      const user = req.decode;
      
      this._validateCampaignId(campaign_id);
      
      const campaign = await this.dripCampaignService.getCampaign(campaign_id, user.uid);
      
      return formSuccess(res, { campaign });
    }, req, res, next);
  }

  async updateCampaignStatus(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { campaign_id } = req.params;
      const { status } = req.body;
      const user = req.decode;
      
      this._validateCampaignId(campaign_id);
      this._validateStatus(status);
      await this.dripCampaignService.updateCampaignStatus(campaign_id, status, user.uid);
      return formSuccess(res, { msg: "Campaign status updated successfully" });
    }, req, res, next);
  }

  async updateCampaign(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { campaign_id } = req.params;
      const user = req.decode;
      const campaignData = this._buildCampaignData(req.body);
      
      this._validateCampaignId(campaign_id);
      this._validateCampaignData(campaignData.title, campaignData.messages);
      
      const campaign = await this.dripCampaignService.updateCampaign(campaign_id, campaignData, user.uid);
      
      return formSuccess(res, { 
        msg: "Campaign updated successfully",
        campaign 
      });
    }, req, res, next);
  }

  async deleteCampaign(req, res, next) {
    return this._handleRequest(async (req, res) => {
      const { campaign_id } = req.params;
      const user = req.decode;
      
      this._validateCampaignId(campaign_id);
      
      await this.dripCampaignService.deleteCampaign(campaign_id, user.uid);
      
      return formSuccess(res, { msg: "Campaign deleted successfully" });
    }, req, res, next);
  }

  async processPendingMessages(req, res, next) {
    return this._handleRequest(async (req, res) => {
      await this.dripCampaignService.processPendingMessages();
      
      return formSuccess(res, { msg: "Pending messages processed" });
    }, req, res, next);
  }
}

module.exports = DripCampaignController;
