const { query } = require("../database/dbpromise");

module.exports = class WebPublicRepository {
    static async getSetting() {
        const settings = await query(`SELECT * FROM web_public;`, []);
        return settings.length < 1 ? null : settings[0];
    }
}       