const CustomException = require("../CustomException");

class FacebookLoginParamMismatchException extends CustomException {
  constructor() {
    super("FacebookLoginParamMismatchException");
  }
}

module.exports = FacebookLoginParamMismatchException;
