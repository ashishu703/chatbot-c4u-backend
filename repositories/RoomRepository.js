const { Room } = require("../models");
const Repository = require("./Repository");

class RoomRepository extends Repository {
  constructor() {
    super(Room);
  }

  async findByUserId(userId) {
    return this.findFirst({ where: { uid: userId } });
  }


  async findMultipleByUid(ids = []) {
    return this.find({ where: { uid: { $in: ids } } });
  }
};


module.exports = RoomRepository