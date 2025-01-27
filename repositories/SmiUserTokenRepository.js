const { query } = require("../database/dbpromise");

module.exports = class SmiUserTokenRepository {
    static async save(userId, platform, token) {
       return query("INSERT INTO `smi_user_tokens` (`uid`, `platform`, `token`) VALUES (?, ?, ?);", [userId, platform, token]);
    }
}