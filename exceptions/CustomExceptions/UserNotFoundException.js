const CustomException = require("../CustomException");

class UserNotFoundException extends CustomException {
  constructor() {
    super("UserNotFoundException");
  }
}

module.exports = UserNotFoundException;
