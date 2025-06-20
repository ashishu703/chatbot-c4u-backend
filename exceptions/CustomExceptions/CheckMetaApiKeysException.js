const CustomException = require("../CustomException");

class CheckMetaApiKeysException extends CustomException {
  constructor() {
    super("CheckMetaApiKeysException");
  }
}

module.exports = CheckMetaApiKeysException;
