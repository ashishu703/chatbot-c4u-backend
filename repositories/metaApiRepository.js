const { MetaApi } = require("../models");

class MetaApiRepository {
  static async findByUid(uid) {
    return await MetaApi.findOne({ where: { uid } });
  }

  static async create(metaApi) {
    return await MetaApi.create(metaApi);
  }
}

module.exports = MetaApiRepository;