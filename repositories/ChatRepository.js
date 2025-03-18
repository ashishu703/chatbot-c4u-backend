const { query } = require("../database/dbpromise");

module.exports = class ChatRepository {
    static async createIfNotExist({
        chat_id, uid, type, last_message_came, chat_note, chat_tags, sender_name, sender_mobile, chat_status, is_opened, last_message, recipient
    }) {
        const isExisting = await this.findChatByChatId(chat_id);
        if (isExisting) {
            return this.updateLastMessage(chat_id, last_message, last_message_came);
        }
        return this.createMessengerChat({
            chat_id, uid, type, last_message_came, chat_note, chat_tags, sender_name, sender_mobile, chat_status, is_opened, last_message, recipient
        });
    }
    static async createMessengerChat({
        chat_id,
        uid,
        type,
        last_message_came,
        chat_note,
        chat_tags,
        sender_name,
        sender_mobile,
        chat_status,
        is_opened,
        last_message,
        recipient
    }) {
        return query(`INSERT INTO chats (chat_id, uid, type, last_message_came, chat_note, chat_tags, sender_name, sender_mobile, chat_status, is_opened, last_message, recipient)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [chat_id, uid, type, last_message_came, chat_note, chat_tags, sender_name, sender_mobile, chat_status, is_opened, last_message, recipient]);
    }



    static async updateLastMessage(id, { last_message_came, last_message }) {
        return query(`UPDATE chats SET last_message = ?, last_message_came = ? WHERE chat_id = ?`, [JSON.stringify(last_message), last_message_came, id]);
    }

    static async findChatByChatId(chatId) {
        const chats = await query(`SELECT * FROM chats WHERE chat_id = ?`, [chatId]);
        return chats.length > 0 ? chats[0] : null;
    }

    static async findUidId(uid) {
        return query(`SELECT * FROM chats WHERE uid = ?`, [uid]);
    }


    static async removePlatformChat(uid, platform) {
        return query(`DELETE FROM chats WHERE uid = ? AND type = ?`, [uid, platform]);
    }

    
}   