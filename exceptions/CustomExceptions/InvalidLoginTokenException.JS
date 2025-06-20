const CustomException = require("../CustomException");

class InvalidLoginTokenException extends CustomException {
  constructor() {
    super("InvalidLoginTokenException");
  }
}

module.exports = InvalidLoginTokenException;
