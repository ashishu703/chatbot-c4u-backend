const { InstagramAccount } = require("../models");
const Repository = require("./Repository");

class InstagramAccountRepository extends Repository {

  constructor() {
    super(InstagramAccount);
  }

  async updateOrCreateAccount(
    userId,
    instagramUserId,
    accountId,
    name,
    username,
    avatar,
    accessToken
  ) {

    return this.updateOrCreate({
      uid: userId,
      instagram_user_id: instagramUserId,
      account_id: accountId,
      name: name,
      username: username,
      avatar: avatar,
      token: accessToken,
    }, { account_id: accountId })

  }

  async findByAccountId(accountId) {
    return this.findFirst({ where: { account_id: accountId } });
  }

  async deleteByAccountId(accountId) {
    return this.delete({ account_id: accountId });
  }

  async findByUserId(userId) {
    return this.delete({ uid: userId });
  }

  async findOneByUserIdAndAccountId(userId, accountId) {
    return this.findFirst({ where: { uid: userId, account_id: accountId } });
  }

  async countByUserId(userId) {
    return this.count({ where: { uid: userId } });
  }
};


module.exports = InstagramAccountRepository