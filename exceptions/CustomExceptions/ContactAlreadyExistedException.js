const CustomException = require("../CustomException");

class ContactAlreadyExistedException extends CustomException {
  constructor() {
    super("ContactAlreadyExistedException");
  }
}

module.exports = ContactAlreadyExistedException;
