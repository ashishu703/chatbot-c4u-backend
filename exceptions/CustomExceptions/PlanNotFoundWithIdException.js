const CustomException = require("../CustomException");

class PlanNotFoundWithIdException extends CustomException {
  constructor() {
    super("PlanNotFoundWithIdException");
  }
}

module.exports = PlanNotFoundWithIdException;
