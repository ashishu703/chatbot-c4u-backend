const CustomException = require("../CustomException");

class EnterPhonebookNameException extends CustomException {
  constructor() {
    super("EnterPhonebookNameException");
  }
}

module.exports = EnterPhonebookNameException;
