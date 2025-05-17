
const CustomException = require("../CustomException");

class NotATrialPlanException extends CustomException {
  constructor() {
    super("NotATrialPlanException");
  }
}

module.exports = NotATrialPlanException;
