const CustomException = require("../CustomException");

class CheckMetaApiException extends CustomException {
  constructor() {
    super("CheckMetaApiException");
  }
}

module.exports = CheckMetaApiException;
