const { query } = require("../database/dbpromise");

module.exports = class WhatsappProfileRepository {
  static async updateOrCreate(
    waba_id,
    business_account_id,
    access_token,
    business_phone_number_id,
    userId,
    app_id,
    pin
  ) {
    const findOne = await query("SELECT * FROM meta_apis WHERE uid = $1", [
      userId,
    ]);
    if (findOne.length > 0) {
      await query(
        `UPDATE meta_apis SET waba_id = $1, business_account_id = $2, access_token = $3, business_phone_number_id = $4, app_id = $5, pin = $6 WHERE uid = $7`,
        [
          waba_id,
          business_account_id,
          access_token,
          business_phone_number_id,
          app_id,
          pin,
          userId,
        ]
      );
    } else {
      await query(
        `INSERT INTO meta_apis (uid, waba_id, business_account_id, access_token, business_phone_number_id, app_id, pin) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          userId,
          waba_id,
          business_account_id,
          access_token,
          business_phone_number_id,
          app_id,
          pin,
        ]
      );
    }
  }

  static async getByAccountId(wabaId) {
    const profiles = await query("SELECT * FROM meta_apis WHERE waba_id = $1", [
      wabaId,
    ]);
    return profiles.length ? profiles[0] : null;
  }

  static async deleteByAccountId(wabaId) {
    const profiles = await query("DELETE FROM meta_apis WHERE waba_id = $1", [
      wabaId,
    ]);
    return profiles;
  }

  static async findManyByUserId(userId) {
    const profiles = await query("SELECT * FROM meta_apis WHERE uid = $1", [
      userId,
    ]);
    return profiles;
  }
};
