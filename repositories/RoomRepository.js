const { Rooms } = require("../models/rooms");

module.exports = class RoomRepository {
  static async findByUserId(userId) {
    const room = await Rooms.findOne({ where: { uid: userId } });
    return room || null;
  }

  static async findMultipleByUid(ids = []) {
    return await Rooms.findAll({ where: { uid: ids } });
  }
}