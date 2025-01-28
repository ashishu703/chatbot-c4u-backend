const { query } = require("../database/dbpromise");

module.exports = class SmiUserTokenRepository {
    static async updateOrCreate(userId, platform, token) {
        const tokens = await this.findByUserId(userId, platform);
        if (tokens) {
            return SmiUserTokenRepository.update(userId, platform, token);
        }
        return SmiUserTokenRepository.create(userId, platform, token);
    }

    static async findByUserId(userId, platform) {
        const tokens = await query(`SELECT * FROM smi_user_tokens WHERE uid = ? AND platform = ?`, [userId, platform]);
        return tokens.length > 0 ? tokens[0] : null;
    }

    static async update(userId, platform, token) {
        return query("UPDATE `smi_user_tokens` SET `token` = ? WHERE uid = ? AND platform = ?", [token, userId, platform]);
    }

    static async create(userId, platform, token) {
        return query("INSERT INTO `smi_user_tokens` (`uid`, `platform`, `token`) VALUES (?, ?, ?);", [userId, platform, token]);
    }
}   