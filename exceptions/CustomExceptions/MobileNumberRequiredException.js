
const CustomException = require("../CustomException");

class MobileNumberRequiredException extends CustomException {
  constructor() {
    super("MobileNumberRequiredException");
  }
}

module.exports = MobileNumberRequiredException;
