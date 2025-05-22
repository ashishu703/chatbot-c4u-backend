const { Broadcast } = require("../models");
const Repository = require("./Repository");

class BroadcastRepository extends Repository {
  constructor() {
    super(Broadcast);
  }


  async updateStatus(broadcast_id, status, uid) {
    return this.update({ status }, { broadcast_id, uid });
  }

}

module.exports = BroadcastRepository;
