const CustomException = require("../CustomException");

class InvalidPhonebookException extends CustomException {
  constructor() {
    super("InvalidPhonebookException");
  }
}

module.exports = InvalidPhonebookException;
