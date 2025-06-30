const CustomException = require("../CustomException");

class PasswordRequiredException extends CustomException {
  constructor() {
    super("PasswordRequiredException");
  }
}

module.exports = PasswordRequiredException;
