const { query } = require('../utils/db');

class MetaRepository {
  async findMetaApiByUid(uid) {
    return query('SELECT * FROM meta_apis WHERE uid = $1', [uid]);
  }

  async updateMetaApi(uid, data) {
    const { waba_id, business_account_id, access_token, business_phone_number_id, app_id } = data;
    return query(
      `UPDATE meta_apis SET waba_id = $1, business_account_id = $2, access_token = $3, 
       business_phone_number_id = $4, app_id = $5 WHERE uid = $6`,
      [waba_id, business_account_id, access_token, business_phone_number_id, app_id, uid]
    );
  }

  async insertMetaApi(data) {
    const { uid, waba_id, business_account_id, access_token, business_phone_number_id, app_id } = data;
    return query(
      `INSERT INTO meta_apis (uid, waba_id, business_account_id, access_token, 
       business_phone_number_id, app_id) VALUES ($1, $2, $3, $4, $5, $6)`,
      [uid, waba_id, business_account_id, access_token, business_phone_number_id, app_id]
    );
  }

  async insertMetaTempletMedia(uid, templet_name, meta_hash, file_name) {
    return query(
      `INSERT INTO meta_templet_media (uid, templet_name, meta_hash, file_name) 
       VALUES ($1, $2, $3, $4)`,
      [uid, templet_name, meta_hash, file_name]
    );
  }
}

module.exports = MetaRepository;