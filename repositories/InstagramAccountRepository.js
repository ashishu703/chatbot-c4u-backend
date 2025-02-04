const { query } = require("../database/dbpromise");

module.exports = class InstagramAccountRepository {
    static async updateOrCreate(userId, instagramUserId, accountId, name, username, avatar, accessToken) {
        const page = await InstagramAccountRepository.findByAccountId(accountId);
        if (page) {
            return InstagramAccountRepository.update(userId, instagramUserId, accountId, name, username, avatar, accessToken);
        }
        return InstagramAccountRepository.create(userId, instagramUserId, accountId, name, username, avatar, accessToken);
    }

    static async findByAccountId(accountId) {
        const pages = await query(`SELECT * FROM instagram_accounts WHERE account_id = ?`, [accountId]);
        return pages.length > 0 ? pages[0] : null;
    }

    static async findByInstagramUserId(instagramUserId) {
        const pages = await query(`SELECT * FROM instagram_accounts WHERE instagram_user_id = ?`, [instagramUserId]);
        return pages.length > 0 ? pages[0] : null;
    }
    static async findByUserId(userId) {
        const pages = await query(`SELECT * FROM instagram_accounts WHERE uid = ?`, [userId]);
        return pages.length > 0 ? pages[0] : null;
    }
    static async create(userId, instagramUserId, accountId, name, username, avatar, accessToken) {
        return query("INSERT INTO `instagram_accounts` (`uid`, `instagram_user_id`, `account_id`,`name`,`username`, `avatar` , `token`) VALUES (?, ?, ?, ?, ?, ?, ?);", [userId, instagramUserId, accountId, name, username, avatar, accessToken]);
    }

    static async update(userId, instagramUserId, accountId, name, username, avatar, accessToken) {
        return query("UPDATE `instagram_accounts` SET `avatar` = ?, `name` = ?, `username` = ?, `uid` = ?, instagram_user_id = ? , `token` = ? WHERE account_id = ?", [avatar, name, username, userId, instagramUserId, accessToken, accountId]);
    }
}