const { query } = require("../database/dbpromise");

module.exports = class AgentChatRepository {
    static async getAssignedAgent(chatId) {
        const agentChats = await query(
            `SELECT * FROM agent_chats WHERE owner_uid = ? AND chat_id = ?`,
            [uid, chatId]
        );

        agentChats.length > 0 ? agentChats[0] : null

    }


    static async getAssignedChats(uid) {
        const agentChats = await query(
            `SELECT * FROM agent_chats WHERE owner_uid = ?`,
            [uid]
        );

        return agentChats;
    }
}   