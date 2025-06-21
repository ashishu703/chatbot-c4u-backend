const CustomException = require("../CustomException");

class PaymentProcessingErrorException extends CustomException {
  constructor() {
    super("PaymentProcessingErrorException");
  }
}

module.exports = PaymentProcessingErrorException;
