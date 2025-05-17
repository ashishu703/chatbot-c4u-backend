const CustomException = require("../CustomException");

class PleaseSelectAgentException extends CustomException {
  constructor() {
    super("PleaseSelectAgentException");
  }
}

module.exports = PleaseSelectAgentException;
