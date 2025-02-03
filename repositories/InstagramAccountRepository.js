const { query } = require("../database/dbpromise");

module.exports = class InstagramAccountRepository {
    static async updateOrCreate(userId, accountId, name, avatar) {
        const page = await InstagramAccountRepository.findByAccountId(accountId);
        if (page) {
            return InstagramAccountRepository.update(userId, accountId, name, avatar);
        }
        return InstagramAccountRepository.create(userId, accountId, name, avatar);
    }

    static async findByAccountId(accountId) {
        const pages = await query(`SELECT * FROM instagram_accounts WHERE account_id = ?`, [accountId]);
        return pages.length > 0 ? pages[0] : null;
    }

    static async create(userId, accountId, name, avatar) {
        return query("INSERT INTO `instagram_accounts` (`uid`, `account_id`,`name`, `avatar`) VALUES (?, ?, ?, ?);", [userId, accountId, name, avatar]);
    }

    static async update(userId, accountId, name, avatar) {
        return query("UPDATE `instagram_accounts` SET `avatar` = ?, `name` = ?, uid = ? WHERE account_id = ?", [avatar, name, userId, accountId]);
    }
}