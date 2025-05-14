
const CustomException = require("../CustomException");

class InvalidRequestException extends CustomException {
  constructor() {
    super("InvalidRequestException");
  }
}

module.exports = InvalidRequestException;
