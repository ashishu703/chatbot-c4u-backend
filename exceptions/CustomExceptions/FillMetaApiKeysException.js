const CustomException = require("../CustomException");

class FillMetaApiKeysException extends CustomException {
  constructor() {
    super("FillMetaApiKeysException");
  }
}

module.exports = FillMetaApiKeysException;
