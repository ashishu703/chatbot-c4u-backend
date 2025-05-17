const { query } = require("../database/dbpromise");

module.exports = class InstagramAccountRepository {
  static async updateOrCreate(
    userId,
    instagramUserId,
    accountId,
    name,
    username,
    avatar,
    accessToken
  ) {
    const page = await InstagramAccountRepository.findByAccountId(accountId);
    if (page) {
      return InstagramAccountRepository.update(
        userId,
        instagramUserId,
        accountId,
        name,
        username,
        avatar,
        accessToken
      );
    }
    return InstagramAccountRepository.create(
      userId,
      instagramUserId,
      accountId,
      name,
      username,
      avatar,
      accessToken
    );
  }

  static async findByAccountId(accountId) {
    const pages = await query(
      "SELECT * FROM instagram_accounts WHERE account_id = $1",
      [accountId]
    );
    return pages.length > 0 ? pages[0] : null;
  }

  static async create(
    userId,
    instagramUserId,
    accountId,
    name,
    username,
    avatar,
    accessToken
  ) {
    return query(
      "INSERT INTO instagram_accounts (uid, instagram_user_id, account_id, name, username, avatar, token) VALUES ($1, $2, $3, $4, $5, $6, $7);",
      [userId, instagramUserId, accountId, name, username, avatar, accessToken]
    );
  }

  static async update(
    userId,
    instagramUserId,
    accountId,
    name,
    username,
    avatar,
    accessToken
  ) {
    return query(
      "UPDATE instagram_accounts SET avatar = $1, name = $2, username = $3, uid = $4, instagram_user_id = $5, token = $6 WHERE account_id = $7",
      [avatar, name, username, userId, instagramUserId, accessToken, accountId]
    );
  }

  static async deleteByAccountId(accountId) {
    return query("DELETE FROM instagram_accounts WHERE account_id = $1", [
      accountId,
    ]);
  }

  static async findManyByUserId(userId) {
    const accounts = await query(
      "SELECT * FROM instagram_accounts WHERE uid = $1",
      [userId]
    );
    return accounts;
  }

  static async findOneByUserIdAndAccountId(userId, accountId) {
    const account = await query(
      "SELECT * FROM instagram_accounts WHERE uid = $1 AND account_id = $2",
      [userId, accountId]
    );
    return account.length > 0 ? account[0] : null;
  }

  static async countByUserId(userId) {
    const result = await query(
      "SELECT COUNT(*) AS count FROM instagram_accounts WHERE uid = $1",
      [userId]
    );
    return result[0].count;
  }
};
