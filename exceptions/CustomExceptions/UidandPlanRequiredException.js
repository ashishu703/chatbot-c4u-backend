const CustomException = require("../CustomException");

class UidandPlanRequiredException extends CustomException {
  constructor() {
    super("UidandPlanRequiredException");
  }
}

module.exports = UidandPlanRequiredException;
