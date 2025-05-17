const { MetaApi, MetaTempletMedia } = require("../models");

class MetaRepository {
  async findMetaApiByUid(uid) {
    return await MetaApi.findOne({ where: { uid } });
  }

  async createMetaApi(metaData) {
    return await MetaApi.create(metaData);
  }

  async updateMetaApi(uid, metaData) {
    const meta = await MetaApi.findOne({ where: { uid } });
    if (meta) {
      return await meta.update(metaData);
    }
    return null;
  }

  async createMetaTempletMedia(mediaData) {
    return await MetaTempletMedia.create(mediaData);
  }

  static async getMetaByUID(uid) {
    const result = await query(`SELECT * FROM meta_api WHERE uid = $1`, [uid]);
    return result.rows[0] || null;
  }
}

module.exports = MetaRepository;
