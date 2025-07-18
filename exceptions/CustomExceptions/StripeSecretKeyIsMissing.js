const CustomException = require("../CustomException");

class StripeSecretKeyIsMissing extends CustomException {
  constructor() {
    super("StripeSecretKeyIsMissing");
  }
}

module.exports = StripeSecretKeyIsMissing;
