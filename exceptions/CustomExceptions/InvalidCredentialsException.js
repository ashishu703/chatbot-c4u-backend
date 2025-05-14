const CustomException = require("../CustomException");

class InvalidCredentialsException extends CustomException {
  constructor() {
    super("InvalidCredentialsException");
  }
}

module.exports = InvalidCredentialsException;
