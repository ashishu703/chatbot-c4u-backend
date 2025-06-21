const CustomException = require("../CustomException");

class PaypalCredentialsRequiredException extends CustomException {
  constructor() {
    super("PaypalCredentialsRequiredException");
  }
}

module.exports = PaypalCredentialsRequiredException;
