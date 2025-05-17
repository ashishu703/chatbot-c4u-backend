
const CustomException = require("../CustomException");

class InvalidMessageTypeException extends CustomException {
  constructor() {
    super("InvalidMessageTypeException");
  }
}

module.exports = InvalidMessageTypeException;
