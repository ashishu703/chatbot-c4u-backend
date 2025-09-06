const { DripCampaign } = require("../models");
const Repository = require("./Repository");

class DripCampaignRepository extends Repository {
  constructor() {
    super(DripCampaign);
  }

  async findByCampaignId(campaign_id, uid) {
    return this.findFirst({ 
      where: { campaign_id, uid },
      include: ['messages']
    });
  }

  async findByUid(uid) {
    return this.find({ 
      where: { uid },
      include: ['messages'],
      order: [['createdAt', 'DESC']]
    });
  }

  async updateStatus(campaign_id, status, uid) {
    return this.update({ status }, { campaign_id, uid });
  }

  async findByStatus(status) {
    return this.find({ where: { status } });
  }
}

module.exports = DripCampaignRepository;
