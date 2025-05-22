const { FacebookPages } = require("../models");
const Repository = require("./Repository");

class FacebookPageRepository extends Repository {
  constructor() {
    super(FacebookPages);
  }

  async updateOrCreateUsingPageId(userId, accountId, pageId, name, token, status) {
    return this.updateOrCreate({
      uid: userId,
      account_id: accountId,
      name: name,
      token: token,
      status: status
    }, { page_id: pageId });
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
        status: 0
      }
    })
  }

  async findInactiveByUserId(userId) {
    return this.findFirst({
      where: {
        uid: userId,
        status: 0
      }
    })
  }

  async findActiveByUserId(userId) {
    return this.findFirst({
      where: {
        uid: userId,
        status: 1
      }
    })
  }

  async activatePagesByUserId(userId, pages) {
    return this.update({ status: 1 }, { uid: userId, page_id: { $in: pages } });
  }

  async deleteInActiveByUserId(userId) {
    return this.delete({ uid: userId, status: 0 });
  }

  async deleteByPageId(pageId) {
    await this.delete({ page_id: pageId });
  }
};

module.exports = FacebookPageRepository;