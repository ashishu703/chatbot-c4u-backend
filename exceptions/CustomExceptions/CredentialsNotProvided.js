const CustomException = require("../CustomException");

class CredentialsNotProvided extends CustomException {
  constructor() {
    super("CredentialsNotProvided");
  }
}

module.exports = CredentialsNotProvided;
