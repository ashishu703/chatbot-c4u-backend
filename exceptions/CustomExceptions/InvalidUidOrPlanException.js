const CustomException = require("../CustomException");

class InvalidUidOrPlanException extends CustomException {
  constructor() {
    super("InvalidUidOrPlanException");
  }
}

module.exports = InvalidUidOrPlanException;
