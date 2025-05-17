const CustomException = require("../CustomException");

class RoomNotFoundException extends CustomException {
  constructor() {
    super("RoomNotFoundException");
  }
}

module.exports = RoomNotFoundException;
