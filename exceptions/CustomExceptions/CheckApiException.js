const CustomException = require("../CustomException");

class CheckApiException extends CustomException {
  constructor() {
    super("CheckApiException");
  }
}

module.exports = CheckApiException;
