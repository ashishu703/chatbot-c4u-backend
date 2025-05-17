const CustomException = require("../CustomException");

class UserIdRequiredException extends CustomException {
  constructor() {
    super("UserIdRequiredException");
  }
}

module.exports = UserIdRequiredException;
