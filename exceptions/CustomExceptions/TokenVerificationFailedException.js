const CustomException = require("../CustomException");

class TokenVerificationFailedException extends CustomException {
  constructor() {
    super("TokenVerificationFailedException");
  }
}

module.exports = TokenVerificationFailedException;
