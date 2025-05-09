const { BroadcastLog } = require("../models");

class BroadcastLogRepository {
   async bulkCreate(logs) {
    return await BroadcastLog.bulkCreate(logs);
  }

   async findByBroadcastId(broadcast_id, uid) {
    return await BroadcastLog.findAll({ where: { broadcast_id, uid } });
  }

   async deleteByBroadcastId(broadcast_id, uid) {
    return await BroadcastLog.destroy({ where: { broadcast_id, uid } });
  }
}

module.exports = BroadcastLogRepository;