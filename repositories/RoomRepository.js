const { query } = require("../database/dbpromise");

module.exports = class RoomRepository {
    static async findByUserId(userId, platform) {
        const romms = await query(`SELECT * FROM rooms WHERE uid = ?`, [userId, platform]);
        return romms.length > 0 ? romms[0] : null;
    }

    static async findMultipleByUid (ids = []) {
        const romms = await query(`SELECT * FROM rooms WHERE uid IN (?)`, [ids]);
        return romms
    }

}   