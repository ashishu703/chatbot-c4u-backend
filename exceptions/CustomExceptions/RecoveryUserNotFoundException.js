const CustomException = require("../CustomException");

class RecoveryUserNotFoundException extends CustomException {
  constructor() {
    super("RecoveryUserNotFoundException");
  }
}

module.exports = RecoveryUserNotFoundException;
