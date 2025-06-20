const CustomException = require("../CustomException");

class CsvMobileMissingException extends CustomException {
  constructor() {
    super("CsvMobileMissingException");
  }
}

module.exports = CsvMobileMissingException;
