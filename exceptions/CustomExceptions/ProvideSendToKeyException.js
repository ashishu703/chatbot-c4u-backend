const CustomException = require("../CustomException");

class ProvideSendToKeyException extends CustomException {
  constructor() {
    super("ProvideSendToKeyException");
  }
}

module.exports = ProvideSendToKeyException;
