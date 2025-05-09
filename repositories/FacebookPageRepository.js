const { query } = require("../database/dbpromise");

module.exports = class FacebookPageRepository {
    static async updateOrCreate(userId, accountId, pageId, name, token, status) {
        const page = await FacebookPageRepository.findByPageId(pageId);
        if (page) {
            return FacebookPageRepository.update(userId, pageId, name, token, status);
        }
        return FacebookPageRepository.create(userId, accountId, pageId, name, token, status);
    }

    static async findByPageId(pageId) {
        const pages = await query(
            `SELECT * FROM facebook_pages WHERE page_id = $1 AND status = $2`,
            [pageId, 1]
        );
        return pages.length > 0 ? pages[0] : null;
    }

    static async findInactiveByPageId(pageId) {
        const pages = await query(
            `SELECT * FROM facebook_pages WHERE page_id = $1 AND status = $2`,
            [pageId, 0]
        );
        return pages.length > 0 ? pages[0] : null;
    }

    static async create(userId, accountId, pageId, name, token, status) {
        return query(
            `INSERT INTO facebook_pages (uid, page_id, name, token, status, account_id)
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [userId, pageId, name, token, status, accountId]
        );
    }

    static async update(userId, pageId, name, token, status) {
        return query(
            `UPDATE facebook_pages
             SET token = $1, name = $2, uid = $3, status = $4
             WHERE page_id = $5`,
            [token, name, userId, status, pageId]
        );
    }

    static async findInactiveByUserId(userId) {
        const pages = await query(
            `SELECT * FROM facebook_pages WHERE uid = $1 AND status = $2`,
            [userId, 0]
        );
        return pages;
    }

    static async findActiveByUserId(userId) {
        const pages = await query(
            `SELECT * FROM facebook_pages WHERE uid = $1 AND status = $2`,
            [userId, 1]
        );
        return pages;
    }

    static async activatePagesByUserId(userId, pages) {
        return query(
            `UPDATE facebook_pages SET status = $1 WHERE uid = $2 AND page_id = ANY($3)`,
            [1, userId, pages]
        );
    }

    static async deleteInActiveByUserId(userId) {
        return query(
            `DELETE FROM facebook_pages WHERE uid = $1 AND status = $2`,
            [userId, 0]
        );
    }

    static async deleteByPageId(pageId) {
        return query(
            `DELETE FROM facebook_pages WHERE page_id = $1`,
            [pageId]
        );
    }
}
