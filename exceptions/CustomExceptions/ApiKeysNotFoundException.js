const CustomException = require("../CustomException");

class ApiKeysNotFoundException extends CustomException {
  constructor() {
    super("ApiKeysNotFoundException");
  }
}

module.exports = ApiKeysNotFoundException;
