const CustomException = require("../CustomException");

class EmailAlreadyTakenException extends CustomException {
  constructor() {
    super("EmailAlreadyTakenException");
  }
}

module.exports = EmailAlreadyTakenException;
