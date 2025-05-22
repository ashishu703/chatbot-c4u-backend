const CustomException = require("../CustomException");

class CannotRemoveAgentDetailException extends CustomException {
  constructor() {
    super("CannotRemoveAgentDetailException");
  }
}

module.exports = CannotRemoveAgentDetailException;
