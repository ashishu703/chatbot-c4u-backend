const CustomException = require("../CustomException");

class ContactNotFoundInPhonebookException extends CustomException {
  constructor() {
    super("ContactNotFoundInPhonebookException");
  }
}

module.exports = ContactNotFoundInPhonebookException;
