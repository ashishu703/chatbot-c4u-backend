const CustomException = require("../CustomException");

class CsvCountryCodeRequiredException extends CustomException {
  constructor() {
    super("CsvCountryCodeRequiredException");
  }
}

module.exports = CsvCountryCodeRequiredException;
