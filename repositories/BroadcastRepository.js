const { Broadcast } =  require("../models");

class BroadcastRepository {
   async create(broadcast) {
    return await Broadcast.create(broadcast);
  }

   async findByUid(uid) {
    return await Broadcast.findAll({ where: { uid } });
  }

   async updateStatus(broadcast_id, status, uid) {
    return await Broadcast.update({ status }, { where: { broadcast_id, uid } });
  }

   async delete(broadcast_id, uid) {
    return await Broadcast.destroy({ where: { broadcast_id, uid } });
  }
}

module.exports = BroadcastRepository;