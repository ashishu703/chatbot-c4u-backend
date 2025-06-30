const CustomException = require("../CustomException");

class TokenExpiredEXception extends CustomException {
  constructor() {
    super("TokenExpiredEXception");
  }
}

module.exports = TokenExpiredEXception;
