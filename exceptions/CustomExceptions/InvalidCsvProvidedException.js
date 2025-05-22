const CustomException = require("../CustomException");

class InvalidCsvProvidedException extends CustomException {
  constructor() {
    super("InvalidCsvProvidedException");
  }
}

module.exports = InvalidCsvProvidedException;
