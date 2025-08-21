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
    // Upsert by primary key `id` to avoid duplicate PK Validation errors
    return this.updateOrCreate(
      {
        id: accountId,
        platform: INSTAGRAM,
        uid: userId,
        social_user_id: instagramUserId,
        social_account_id: accountId,
        name: name,
        username: username,
        token: token,
        avatar: profile_picture_url,
        expires_in: 0,
      },
      {
        id: accountId,
      }
    )
  }
  async updateOrCreateFacebookProfile(
    userId,
    accountId,
    username,
    name,
    avatar,
    accessToken,
  ) {

    // Upsert by primary key `id` to avoid duplicate PK Validation errors
    return this.updateOrCreate(
      {
        id: accountId,
        platform: MESSANGER,
        avatar,
        uid: userId,
        social_user_id: accountId,
        social_account_id: accountId,
        name: name,
        username: username,
        token: accessToken,
        expires_in: 0,
      },
      {
        id: accountId,
      }
    )
  }

  async updateOrCreateWhatsappProfile(
    userId,
    wabaId,
    phoneNumberId,
    socialUserId,
    name,
    accessToken,

  ) {

    console.log("[SocialAccountRepository] upsert whatsapp", { userId, wabaId, phoneNumberId, socialUserId, name, hasToken: !!accessToken });
    // Use primary key id for uniqueness to avoid duplicate PK Validation errors
    return this.updateOrCreate(
      {
        id: wabaId,
        platform: WHATSAPP,
        avatar: null,
        uid: userId,
        social_user_id: phoneNumberId,
        social_account_id: wabaId,
        name: name,
        username: socialUserId,
        token: accessToken,
        expires_in: 0,
      },
      {
        id: wabaId,
      }
    )
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