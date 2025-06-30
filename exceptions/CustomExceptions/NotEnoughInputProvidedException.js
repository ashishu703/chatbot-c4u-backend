const CustomException = require("../CustomException");

class NotEnoughInputProvidedException extends CustomException {
  constructor() {
    super("NotEnoughInputProvidedException");
  }
}

module.exports = NotEnoughInputProvidedException;
