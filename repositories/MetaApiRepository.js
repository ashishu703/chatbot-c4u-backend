const { MetaApi } = require("../models");
const Repository = require("./Repository");

class MetaRepository extends Repository {
  constructor() {
    super(MetaApi);
  }

  async findMetaApiByUid(uid) {
    return this.findFirst({ where: { uid } });
  }

  async createMetaApi(metaData) {
    return this.create(metaData);
  }

  async updateMetaApi(uid, metaData) {
    return this.update(metaData, { uid });
  }


  async getMetaByUID(uid) {
    return this.findFirst({ where: { uid } });
  }
}

module.exports = MetaRepository;
