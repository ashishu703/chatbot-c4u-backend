const CustomException = require("../CustomException");

class PaymentDetailsNotFoundException extends CustomException {
  constructor() {
    super("PaymentDetailsNotFoundException");
  }
}

module.exports = PaymentDetailsNotFoundException;
