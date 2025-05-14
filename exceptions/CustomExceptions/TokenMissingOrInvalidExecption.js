const CustomException = require("../CustomException");

class TokenMissingOrInvalidExecption extends CustomException {
  constructor() {
    super("TokenMissingOrInvalidExecption");
  }
}

module.exports = TokenMissingOrInvalidExecption;
