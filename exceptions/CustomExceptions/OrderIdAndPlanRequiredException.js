
const CustomException = require("../CustomException");

class OrderIdAndPlanRequiredException extends CustomException {
  constructor() {
    super("OrderIdAndPlanRequiredException");
  }
}

module.exports = OrderIdAndPlanRequiredException;
