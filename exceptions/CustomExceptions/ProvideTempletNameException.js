const CustomException = require("../CustomException");

class ProvideTempletNameException extends CustomException {
  constructor() {
    super("ProvideTempletNameException");
  }
}

module.exports = ProvideTempletNameException;
