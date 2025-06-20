const CustomException = require("../CustomException");

class AdminNotFoundException extends CustomException {
  constructor() {
    super("AdminNotFoundException");
  }
}

module.exports = AdminNotFoundException;
