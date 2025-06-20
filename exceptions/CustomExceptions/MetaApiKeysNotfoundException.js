const CustomException = require("../CustomException");

class MetaApiKeysNotfoundException extends CustomException {
  constructor() {
    super("MetaApiKeysNotfoundException");
  }
}

module.exports = MetaApiKeysNotfoundException;
