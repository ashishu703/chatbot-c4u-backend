const CustomException = require("../CustomException");

class UserAlreadyExistException extends CustomException {
  constructor() {
    super("UserAlreadyExistException");
  }
}

module.exports = UserAlreadyExistException;
