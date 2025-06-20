const CustomException = require("../CustomException");

class TokenNotVerifiedException extends CustomException {
  constructor() {
    super("TokenNotVerifiedException");
  }
}

module.exports = TokenNotVerifiedException;
