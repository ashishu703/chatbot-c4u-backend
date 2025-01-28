const { query } = require("../database/dbpromise");

module.exports = class FacebookPageRepository {
    static async updateOrCreate(userId, pageId, name, token) {
        const page = await FacebookPageRepository.findByPageId(pageId);
        if (page) {
            return FacebookPageRepository.update(userId, pageId, name, token);
        }
        return FacebookPageRepository.create(userId, pageId, name, token);
    }

    static async findByPageId(pageId) {
        const pages = await query(`SELECT * FROM facebook_pages WHERE page_id = ?`, [pageId]);
        return pages.length > 0 ? pages[0] : null;
    }

    static async create(userId, pageId, name, token) {
        return query("INSERT INTO `facebook_pages` (`uid`, `page_id`,`name`, `token`) VALUES (?, ?, ?, ?);", [userId, pageId, name, token]);
    }

    static async update(userId, pageId, name, token) {
        return query("UPDATE `facebook_pages` SET `token` = ?, `name` = ?, uid = ? WHERE page_id = ?", [token, name, userId, pageId]);
    }
}