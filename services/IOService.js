const { getIOInstance } = require("../utils/socket.utils");


class IOService {
  io;
  constructor() {

  }

  initIO() {
    this.io = getIOInstance();
  }



  async emit(socketId, event, data) {
    this.io.to(socketId).emit(event, data);
  }


};
module.exports = IOService