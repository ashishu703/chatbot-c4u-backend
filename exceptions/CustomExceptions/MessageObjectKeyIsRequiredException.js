const CustomException = require("../CustomException");

class MessageObjectKeyIsRequiredException extends CustomException {
  constructor() {
    super("MessageObjectKeyIsRequiredException");
  }
}

module.exports = MessageObjectKeyIsRequiredException;
