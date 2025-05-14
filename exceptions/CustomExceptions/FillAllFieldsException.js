const CustomException = require("../CustomException");

class FillAllFieldsException extends CustomException {
  constructor() {
    super("FillAllFieldsException");
  }
}

module.exports = FillAllFieldsException;
