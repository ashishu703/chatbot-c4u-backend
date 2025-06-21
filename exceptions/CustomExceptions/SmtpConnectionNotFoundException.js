const CustomException = require("../CustomException");

class SmtpConnectionNotFoundException extends CustomException {
  constructor() {
    super("SmtpConnectionNotFoundException");
  }
}

module.exports = SmtpConnectionNotFoundException;
