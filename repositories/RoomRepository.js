const { Rooms } = require("../models");

module.exports = class RoomRepository {
   async findByUserId(userId) {
    const room = await Rooms.findOne({ where: { uid: userId } });
    return room || null;
  }

   async findMultipleByUid(ids = []) {
    return await Rooms.findAll({ where: { uid: ids } });
  }
}