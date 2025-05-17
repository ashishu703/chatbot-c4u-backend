const CustomException = require("../CustomException");

class FillRazorpayCredentialsException extends CustomException {
  constructor() {
    super("FillRazorpayCredentialsException");
  }
}

module.exports = FillRazorpayCredentialsException;
