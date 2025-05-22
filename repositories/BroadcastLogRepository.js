const { BroadcastLog } = require("../models");
const Repository = require("./Repository");

class BroadcastLogRepository extends Repository {
  constructor() {
    super(BroadcastLog);
  }

  async findByBroadcastId(broadcast_id, uid) {
    return this.find({ where: { broadcast_id, uid } });
  }

  async deleteByBroadcastId(broadcast_id, uid) {
    return this.delete({ broadcast_id, uid });
  }
}

module.exports = BroadcastLogRepository;
