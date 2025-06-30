const CustomException = require("../CustomException");

class PasswordNotProvidedException extends CustomException {
  constructor() {
    super("PasswordNotProvidedException");
  }
}

module.exports = PasswordNotProvidedException;
