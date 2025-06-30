const CustomException = require("../CustomException");

class EmailAlreadyInUseException extends CustomException {
  constructor() {
    super("EmailAlreadyInUseException");
  }
}

module.exports = EmailAlreadyInUseException;
