const CustomException = require("../CustomException");

class PlanRequiredException extends CustomException {
  constructor() {
    super("Plan selection is required", 400);
  }
}

module.exports = PlanRequiredException;
