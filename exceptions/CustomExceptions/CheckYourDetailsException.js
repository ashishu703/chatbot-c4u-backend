const CustomException = require("../CustomException");

class CheckYourDetailsException extends CustomException {
  constructor() {
    super("CheckYourDetailsException");
  }
}

module.exports = CheckYourDetailsException;
