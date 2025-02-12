const { query } = require("../database/dbpromise");

module.exports = class WhatsappProfileRepository {
    static async updateOrCreate(
        waba_id,
        business_account_id,
        access_token,
        business_phone_number_id,
        userId,
        app_id
    ) {
        const findOne = await query(`SELECT * FROM meta_api WHERE uid = ?`, [
            userId,
        ]);
        if (findOne.length > 0) {
            await query(
                `UPDATE meta_api SET waba_id = ?, business_account_id = ?, access_token = ?, business_phone_number_id = ?, app_id = ? WHERE uid = ?`,
                [
                    waba_id,
                    business_account_id,
                    access_token,
                    business_phone_number_id,
                    app_id,
                    userId,
                ]
            );
        } else {
            await query(
                `INSERT INTO meta_api (uid, waba_id, business_account_id, access_token, business_phone_number_id,app_id) VALUES (?,?,?,?,?,?)`,
                [
                    userId,
                    waba_id,
                    business_account_id,
                    access_token,
                    business_phone_number_id,
                    app_id
                ]
            );
        }

    }

    static async deleteByAccountId(wabaId) {
        const profiles = await query(`DELETE FROM meta_api WHERE waba_id = ? `, [wabaId]);
        return profiles;
    }

    static async findManyByUserId(userId) {
        const profiles = await query(`SELECT * FROM meta_api WHERE uid = ? `, [userId]);
        return profiles;
    }
}       