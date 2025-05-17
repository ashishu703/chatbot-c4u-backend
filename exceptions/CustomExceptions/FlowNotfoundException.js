const CustomException = require("../CustomException");

class FlowNotfoundException extends CustomException {
  constructor() {
    super("FlowNotfoundException");
  }
}

module.exports = FlowNotfoundException;
