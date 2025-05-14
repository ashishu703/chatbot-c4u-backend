const CustomException = require("../CustomException");

class UrlAndTypeRequiredException extends CustomException {
  constructor() {
    super("UrlAndTypeRequiredException");
  }
}

module.exports = UrlAndTypeRequiredException;
