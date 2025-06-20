const CustomException = require("../CustomException");

class PhoneIdMismatchException extends CustomException {
  constructor() {
    super("PhoneIdMismatchException");
  }
}

module.exports = PhoneIdMismatchException;
