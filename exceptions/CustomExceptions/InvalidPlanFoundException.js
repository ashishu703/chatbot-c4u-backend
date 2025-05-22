const CustomException = require("../CustomException");

class InvalidPlanFoundException extends CustomException {
  constructor() {
    super("InvalidPlanFoundException");
  }
}

module.exports = InvalidPlanFoundException;
