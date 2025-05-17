
const CustomException = require("../CustomException");

class UploadSessionFailedException extends CustomException {
  constructor() {
    super("UploadSessionFailedException");
  }
}

module.exports = UploadSessionFailedException;
