const CustomException = require("../CustomException");

class FlowIdException extends CustomException {
  constructor() {
    super("FlowIdException");
  }
}

module.exports = FlowIdException;
