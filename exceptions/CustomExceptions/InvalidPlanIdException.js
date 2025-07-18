const CustomException = require("../CustomException");

class InvalidPlanIdException extends CustomException {
  constructor() {
    super("InvalidPlanIdException");
  }
}

module.exports = InvalidPlanIdException;
