const CustomException = require("../CustomException");

class ChatDisabledException extends CustomException {
  constructor() {
    super("ChatDisabledException");
  }
}

module.exports = ChatDisabledException;
