const { query } = require("../database/dbpromise");

module.exports = class QuickReplyRepository {
    static async createIfNotExist({
        uid, message
    }) {
        const isExisting = await this.findChatByMessageAndUid(uid, message);
        if (!isExisting) {
            return this.createQuickReply({
                uid, message
            });
        }

    }
    static async createQuickReply({
        uid,
        message
    }) {
        return query(`INSERT INTO quick_replies (uid, message)
        VALUES (?, ?)`, [uid, message]);
    }

    static async findChatByMessageAndUid(uid, message) {
        const quick_replies = await query(`SELECT * FROM quick_replies WHERE message = ? AND uid = ?`, [message, uid]);
        return quick_replies.length > 0 ? quick_replies[0] : null;
    }

    static async findUidId(uid) {
        return query(`SELECT * FROM quick_replies WHERE uid = ?`, [uid]);
    }


    static async removeById(id) {
        return query(`DELETE FROM quick_replies WHERE id = ?`, [id]);
    }


}   