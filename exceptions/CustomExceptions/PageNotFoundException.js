const CustomException = require("../CustomException");

class PageNotFoundException extends CustomException {
  constructor() {
    super("PageNotFoundException");
  }
}

module.exports = PageNotFoundException;
