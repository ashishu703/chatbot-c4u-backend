
const CustomException = require("../CustomException");

class AuthenticationFailedException extends CustomException {
  constructor() {
    super("AuthenticationFailedException");
  }
}

module.exports = AuthenticationFailedException;
