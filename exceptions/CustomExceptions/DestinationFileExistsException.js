const CustomException = require("../CustomException");

class DestinationFileExistsException extends CustomException {
  constructor() {
    super("DestinationFileExistsException");
  }
}

module.exports = DestinationFileExistsException;
