const CustomException = require("../CustomException");

class DuplicatePhonebookNameException extends CustomException {
  constructor() {
    super("DuplicatePhonebookNameException");
  }
}

module.exports = DuplicatePhonebookNameException;
