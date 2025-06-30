const { MetaApi } = require("../models");
const Repository = require("./Repository");

class WhatsappProfileRepository extends Repository {

  constructor() {
    super(MetaApi);
  }


  async getByAccountId(wabaId) {
    return this.findFirst({ where: { waba_id: wabaId } });
  }

  async deleteByAccountId(wabaId) {
    return this.delete({ waba_id: wabaId });
  }

};
module.exports = WhatsappProfileRepository