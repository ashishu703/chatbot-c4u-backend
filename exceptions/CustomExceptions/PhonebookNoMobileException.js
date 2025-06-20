const CustomException = require("../CustomException");

class PhonebookNoMobileException extends CustomException {
  constructor() {
    super("PhonebookNoMobileException");
  }
}

module.exports = PhonebookNoMobileException;
