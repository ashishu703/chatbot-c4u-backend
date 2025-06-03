const { SocialAccount } = require("../models");
const Repository = require("./Repository");

class SocialAccountRepository extends Repository {
  constructor() {
    super(SocialAccount);
  }

  async updateOrCreateProfile(userId, accountId, name, token) {
    return this.updateOrCreate({
      token: token,
      name: name,
      uid: userId,
      account_id: accountId,
    }, {
      uid: userId,
      account_id: accountId
    })
  }

  async findByUserIdAndAccountId(userId, accountId) {
    return this.findFirst({
      where: {
        uid: userId,
        account_id: accountId
      }
    })
  }

  async findManyByUserId(userId) {
    return this.find({
      where: {
        uid: userId
      }
    })
  }

  async deleteByAccountId(accountId) {
    return this.delete({ account_id: accountId });
  }
};

module.exports = SocialAccountRepository;