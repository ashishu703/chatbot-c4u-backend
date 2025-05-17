const CustomException = require("../CustomException");

class InvalidTemplateDataException extends CustomException {
  constructor() {
    super("InvalidTemplateDataException");
  }
}

module.exports = InvalidTemplateDataException;
