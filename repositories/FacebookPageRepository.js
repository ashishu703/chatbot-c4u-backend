const { query } = require("../database/dbpromise");

module.exports = class FacebookPageRepository {
    static async save(userId, pageId, name, token) {
        return query("INSERT INTO `facebook_pages` (`uid`, `page_id`,`name`, `token`) VALUES (?, ?, ?, ?);", [userId, pageId, name, token]);
    }
}