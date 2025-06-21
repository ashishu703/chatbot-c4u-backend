const { SocialAccount } = require("../models");
const { INSTAGRAM, MESSANGER, WHATSAPP } = require("../types/social-platform-types");
const Repository = require("./Repository");

class SocialAccountRepository extends Repository {
  constructor() {
    super(SocialAccount);
  }

  async updateOrCreateInstagramProfile(
    accountId,
    userId,
    profile_picture_url,
    username,
    name,
    instagramUserId,
    token
  ) {
    return this.updateOrCreate({
      platform: INSTAGRAM,
      uid: userId,
      social_user_id: instagramUserId,
      social_account_id: accountId,
      name: name,
      username: username,
      token: token,
      avatar: profile_picture_url,
      expires_in: 0
    }, {
      uid: userId,
      social_account_id: accountId,
      platform: INSTAGRAM,
    })
  }
  async updateOrCreateFacebookProfile(
    userId,
    accountId,
    username,
    name,
    avatar,
    accessToken,
  ) {

    return this.updateOrCreate({
      platform: MESSANGER,
      avatar,
      uid: userId,
      social_user_id: accountId,
      social_account_id: accountId,
      name: name,
      username: username,
      token: accessToken,
      expires_in: 0
    }, {
      uid: userId,
      social_account_id: accountId,
      platform: MESSANGER
    })
  }

  async updateOrCreateWhatsappProfile(
    userId,
    wabaId,
    phoneNumberId,
    socialUserId,
    name,
    accessToken,

  ) {

    return this.updateOrCreate({
      platform: WHATSAPP,
      avatar: null,
      uid: userId,
      social_user_id: phoneNumberId,
      social_account_id: wabaId,
      name: name,
      username: socialUserId,
      token: accessToken,
      expires_in: 0
    }, {
      uid: userId,
      social_account_id: wabaId,
      platform: WHATSAPP,
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
    return this.delete({ social_account_id: accountId });
  }

  async getInstagramAccount(userid, relations = []) {
    return this.findFirst({
      where: {
        uid: userid,
        platform: INSTAGRAM
      },
    }, relations)
  }

  async getMessangerAccount(userid, relations = []) {
    return this.findFirst({
      where: {
        uid: userid,
        platform: MESSANGER
      },
    }, relations)
  }

  async getWhatsappAccount(userid, relations = []) {
    return this.findFirst({
      where: {
        uid: userid,
        platform: WHATSAPP
      }
    }, relations)
  }
};

module.exports = SocialAccountRepository;