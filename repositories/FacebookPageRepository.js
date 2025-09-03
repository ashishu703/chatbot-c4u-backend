const { Op } = require("sequelize");
const { FacebookPage } = require("../models");
const { ACTIVE, INACTIVE } = require("../types/facebook-page-status.types");
const Repository = require("./Repository");

class FacebookPageRepository extends Repository {
  constructor() {
    super(FacebookPage);
  }


  async findByPageId(pageId) {
    return this.findFirst({
      where: {
        page_id: pageId
      }
    })
  }

  async findInactiveByPageId(pageId) {
    return this.findFirst({
      where: {
        page_id: pageId,
        is_active: INACTIVE
      }
    })
  }

  async findInactiveByUserId(userId) {
    return this.findFirst({
      where: {
        uid: userId,
        is_active: INACTIVE
      }
    })
  }

  async findActiveByUserId(userId) {
    return this.findFirst({
      where: {
        uid: userId,
        is_active: ACTIVE
      }
    })
  }

  async activatePagesByUserId(userId, pages) {
    return this.update({ is_active: ACTIVE }, { uid: userId, page_id: { [Op.in]: pages } });
  }

  async deleteInActiveByUserId(userId) {
    return this.delete({ uid: userId, is_active: INACTIVE });
  }

  async deleteByPageId(pageId) {
    await this.delete({ page_id: pageId });
  }

  async findFirstWithAccount(condition = {}) {
    return this.findFirst(condition, ["account"]);
  }
};

module.exports = FacebookPageRepository;