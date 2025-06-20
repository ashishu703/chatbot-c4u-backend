const CustomException = require("../CustomException");

class ChatNotFoundException extends CustomException {
  constructor() {
    super("ChatNotFoundException");
  }
}

module.exports = ChatNotFoundException;
