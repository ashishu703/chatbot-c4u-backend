const CustomException = require("../CustomException");

class ProvideTemplateException extends CustomException {
  constructor() {
    super("ProvideTemplateException");
  }
}

module.exports = ProvideTemplateException;
