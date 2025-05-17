const RoomRepository = require("../repositories/RoomRepository");
const { getIOInstance } = require("../socket");

module.exports = class IOService {
  io;
  uid;
  room;
  constructor(uid) {
    this.io = getIOInstance();
    this.uid = uid;
  }

  async initSocket() {
    this.room = await RoomRepository.findByUserId(this.uid);
  }

  async emit(event, data) {
    this.io.to(this.room?.socket_id).emit(event, data);
  }
};
