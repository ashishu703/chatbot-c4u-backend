const CustomException = require("../CustomException");

class InvalidEmailIdException extends CustomException {
  constructor() {
    super("InvalidEmailIdException");
  }
}

module.exports = InvalidEmailIdException;
