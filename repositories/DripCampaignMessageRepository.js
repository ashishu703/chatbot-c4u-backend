const { DripCampaignMessage } = require("../models");
const Repository = require("./Repository");

class DripCampaignMessageRepository extends Repository {
  constructor() {
    super(DripCampaignMessage);
  }

  async findByCampaignId(campaign_id) {
    return this.find({ 
      where: { campaign_id },
      order: [['createdAt', 'ASC']]
    });
  }

  async findByStatus(status) {
    return this.find({ where: { status } });
  }

  async updateStatus(message_id, status) {
    return this.update({ status }, { message_id });
  }

  async bulkCreate(messages) {
    return this.model.bulkCreate(messages);
  }

  async findPendingMessages() {
    return this.find({ 
      where: { 
        status: 'pending',
        scheduled_at: { [require('sequelize').Op.lte]: new Date() }
      }
    });
  }
}

module.exports = DripCampaignMessageRepository;
