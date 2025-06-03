const RoomRepository = require("../repositories/RoomRepository");
const { getIOInstance } = require("../socket");

module.exports = class IOService {
  io;
  uid;
  room;
  constructor(uid) {
    this.io = getIOInstance();
    this.uid = uid;
    this.roomRepository = new RoomRepository();
  }

  async initSocket() {
    this.room = await this.roomRepository.findByUserId(this.uid);
  }

  async emit(event, data) {
    this.io.to(this.room?.socket_id).emit(event, data);
  }
};
