const { query } = require("../database/dbpromise");

module.exports = class InstagramAccountRepository {
    static async updateOrCreate(userId, accountId, name, avatar, accessToken) {
        const page = await InstagramAccountRepository.findByAccountId(accountId);
        if (page) {
            return InstagramAccountRepository.update(userId, accountId, name, avatar, accessToken);
        }
        return InstagramAccountRepository.create(userId, accountId, name, avatar, accessToken);
    }

    static async findByAccountId(accountId) {
        const pages = await query(`SELECT * FROM instagram_accounts WHERE account_id = ?`, [accountId]);
        return pages.length > 0 ? pages[0] : null;
    }

    static async create(userId, accountId, name, avatar, accessToken) {
        return query("INSERT INTO `instagram_accounts` (`uid`, `account_id`,`name`, `avatar` , `token`) VALUES (?, ?, ?, ?, ?);", [userId, accountId, name, avatar, accessToken]);
    }

    static async update(userId, accountId, name, avatar, accessToken) {
        return query("UPDATE `instagram_accounts` SET `avatar` = ?, `name` = ?, uid = ? , `token` = ? WHERE account_id = ?", [avatar, name, userId, accessToken, accountId]);
    }
}