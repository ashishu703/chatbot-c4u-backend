const CustomException = require("../CustomException");

class TemplateNameRequiredException extends CustomException {
  constructor() {
    super("TemplateNameRequiredException");
  }
}

module.exports = TemplateNameRequiredException;
