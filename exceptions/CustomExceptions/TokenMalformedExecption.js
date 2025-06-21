const CustomException = require("../CustomException");

class TokenMalformedExecption extends CustomException {
  constructor() {
    super("TokenMalformedExecption");
  }
}

module.exports = TokenMalformedExecption;
