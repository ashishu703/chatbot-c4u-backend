const CustomException = require("../CustomException");

class WebConfigNotFoundException extends CustomException {
  constructor() {
    super("WebConfigNotFoundException");
  }
}

module.exports = WebConfigNotFoundException;
