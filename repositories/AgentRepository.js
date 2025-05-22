const { Agent } = require("../models");
const Repository = require("./Repository");

class AgentRepository extends Repository {

  constructor() {
    super(Agent);
  }

  async findByEmail(email) {
    return this.findFirst({ where: { email } });
  }

  async findByOwner(owner_uid) {
    return this.find({ where: { owner_uid } });
  }


  async updateActiveness(uid, is_active) {
    return this.update({ is_active }, { uid });
  }

}

module.exports = AgentRepository;
