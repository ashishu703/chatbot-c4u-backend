const CustomException = require("../CustomException");

class TrialAlreadyTakenException extends CustomException {
  constructor() {
    super("TrialAlreadyTakenException");
  }
}

module.exports = TrialAlreadyTakenException;
