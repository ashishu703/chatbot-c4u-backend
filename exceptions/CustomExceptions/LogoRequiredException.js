const CustomException = require("../CustomException");

class LogoRequiredException extends CustomException {
  constructor() {
    super("LogoRequiredException");
  }
}

module.exports = LogoRequiredException;
