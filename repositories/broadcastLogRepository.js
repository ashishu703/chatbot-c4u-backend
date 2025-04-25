const { BroadcastLog } = require("../models/broadcast_log");

class BroadcastLogRepository {
  static async bulkCreate(logs) {
    return await BroadcastLog.bulkCreate(logs);
  }

  static async findByBroadcastId(broadcast_id, uid) {
    return await BroadcastLog.findAll({ where: { broadcast_id, uid } });
  }

  static async deleteByBroadcastId(broadcast_id, uid) {
    return await BroadcastLog.destroy({ where: { broadcast_id, uid } });
  }
}

module.exports = BroadcastLogRepository;