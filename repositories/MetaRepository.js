const { MetaApi } = require("../models");
const Repository = require("./Repository");

class MetaRepository extends Repository {
  constructor() {
    super(MetaApi);
  }

  async findMetaApiByUid(uid) {
    return this.findFirst({ where: { uid } });
  }

  async updateMetaApi(uid, data) {
    return this.update(data, { uid });
  }
}

module.exports = MetaRepository;
