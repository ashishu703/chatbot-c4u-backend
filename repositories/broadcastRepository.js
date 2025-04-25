const { Broadcast } = require("../models/broadcast");

class BroadcastRepository {
  static async create(broadcast) {
    return await Broadcast.create(broadcast);
  }

  static async findByUid(uid) {
    return await Broadcast.findAll({ where: { uid } });
  }

  static async updateStatus(broadcast_id, status, uid) {
    return await Broadcast.update({ status }, { where: { broadcast_id, uid } });
  }

  static async delete(broadcast_id, uid) {
    return await Broadcast.destroy({ where: { broadcast_id, uid } });
  }
}

module.exports = BroadcastRepository;