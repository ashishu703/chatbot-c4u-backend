const CustomException = require("../CustomException");

class ProfileNotFoundException extends CustomException {
  constructor() {
    super("ProfileNotFoundException");
  }
}

module.exports = ProfileNotFoundException;
