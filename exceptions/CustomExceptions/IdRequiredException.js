const CustomException = require("../CustomException");

class IdRequiredException extends CustomException {
  constructor() {
    super("IdRequiredException");
  }
}

module.exports = IdRequiredException;
