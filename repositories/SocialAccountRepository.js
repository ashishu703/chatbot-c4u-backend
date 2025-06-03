const { SocialAccount } = require("../models");
const { INSTAGRAM, MESSANGER, WHATSAPP } = require("../types/social-platform-types");
const Repository = require("./Repository");

class SocialAccountRepository extends Repository {
  constructor() {
    super(SocialAccount);
  }

  async updateOrCreateInstagramProfile(id,
    accountId,
    userId,
    profile_picture_url,
    username,
    name,
    user_id,
    token
  ) {
    return this.updateOrCreate({
      platform: INSTAGRAM,
      uid: userId,
      social_user_id: user_id,
      social_account_id: id,
      name: name,
      username: username,
      token: token,
      refresh_token: "",
      avatar: profile_picture_url,
      expires_in: 0
    }, {
      uid: userId,
      social_account_id: accountId
    })
  }
  async updateOrCreateFacebookProfile(id,
    accountId,
    userId,
    profile_picture_url,
    username,
    name,
    user_id,
    token
  ) {
    return this.updateOrCreate({
      platform: MESSANGER,
      uid: userId,
      social_user_id: user_id,
      social_account_id: id,
      name: name,
      username: username,
      token: token,
      refresh_token: "",
      avatar: profile_picture_url,
      expires_in: 0
    }, {
      uid: userId,
      social_account_id: accountId
    })
  }

  async updateOrCreateWhatsappProfile(id,
    accountId,
    userId,
    profile_picture_url,
    username,
    name,
    user_id,
    token
  ) {
    return this.updateOrCreate({
      platform: WHATSAPP,
      uid: userId,
      social_user_id: user_id,
      social_account_id: id,
      name: name,
      username: username,
      token: token,
      refresh_token: "",
      avatar: profile_picture_url,
      expires_in: 0
    }, {
      uid: userId,
      social_account_id: accountId
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