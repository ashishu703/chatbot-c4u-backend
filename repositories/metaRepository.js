const {MetaApi,MetaTempletMedia} = require('../models');

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
}

module.exports = new MetaRepository();