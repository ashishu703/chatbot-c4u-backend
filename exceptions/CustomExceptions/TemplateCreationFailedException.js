const CustomException = require("../CustomException");

class TemplateCreationFailedException extends CustomException {
  constructor() {
    super("TemplateCreationFailedException");
  }
}

module.exports = TemplateCreationFailedException;
