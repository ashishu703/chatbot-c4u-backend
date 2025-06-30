const CustomException = require("../CustomException");

class UidRequiredException extends CustomException {
  constructor() {
    super("UidRequiredException");
  }
}

module.exports = UidRequiredException;
