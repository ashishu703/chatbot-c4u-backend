const CustomException = require("../CustomException");

class PaymentKeysNotFoundException extends CustomException {
  constructor() {
    super("PaymentKeysNotFoundException");
  }
}

module.exports = PaymentKeysNotFoundException;
