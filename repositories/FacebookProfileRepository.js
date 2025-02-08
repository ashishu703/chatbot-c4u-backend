const { query } = require("../database/dbpromise");

module.exports = class FacebookProfileRepository {
    static async updateOrCreate(userId, accountId, name, token) {
        const tokens = await this.findByUserIdAndAccountId(userId, accountId);
     
        if (tokens) {
            return FacebookProfileRepository.update(userId, accountId, token, name);
        }
        return FacebookProfileRepository.create(userId, accountId, token, name);
    }

    static async findByUserIdAndAccountId(userId, accountId) {
        const tokens = await query(`SELECT * FROM facebook_profiles WHERE uid = ? AND account_id = ? `, [userId, accountId]);
        return tokens.length > 0 ? tokens[0] : null;
    }

    static async update(userId, accountId, token, name) {
        return query("UPDATE `facebook_profiles` SET `token` = ?, name = ? WHERE uid = ? AND account_id = ?", [token, name, userId, accountId]);
    }

    static async create(userId, accountId, token, name) {
        return query("INSERT INTO `facebook_profiles` (`token`,  `name`, `uid`, `account_id`) VALUES (?, ?, ?, ?);", [token, name, userId, accountId]);
    }

    static async findManyByUserId(userId) {
        const profiles = await query(`SELECT * FROM facebook_profiles WHERE uid = ? `, [userId]);
        return profiles;
    }
   
    static async deleteByAccountId(accountId) {
        const profiles = await query(`DELETE FROM facebook_profiles WHERE account_id = ? `, [accountId]);
        return profiles;
    }
}   