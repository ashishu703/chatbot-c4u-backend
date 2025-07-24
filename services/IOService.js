const { getIOInstance } = require("../utils/socket.utils");


class IOService {
  io;
  constructor() {

  }

  initIO() {
    this.io = getIOInstance();
    return this;
  }

  setIO(io) {
    this.io = io;
    return this;
  }



  async emit(socketId, event, data) {
    console.log("SOCKET_EVENT", {
      event,
      data
    })
    this.io.to(socketId).emit(event, data);
  }


};
module.exports = IOService