const CustomException = require("../CustomException");

class UserPlanExpiredException extends CustomException {
  constructor() {
    super("UserPlanExpiredException");
  }
}

module.exports = UserPlanExpiredException;
