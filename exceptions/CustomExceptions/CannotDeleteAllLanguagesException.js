const CustomException = require("../CustomException");

class CannotDeleteAllLanguagesException extends CustomException {
  constructor() {
    super("CannotDeleteAllLanguagesException");
  }
}

module.exports = CannotDeleteAllLanguagesException;
