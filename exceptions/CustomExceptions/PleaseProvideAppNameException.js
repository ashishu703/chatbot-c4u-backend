const CustomException = require("../CustomException");

class PleaseProvideAppNameException extends CustomException {
  constructor() {
    super("PleaseProvideAppNameException");
  }
}

module.exports = PleaseProvideAppNameException;
