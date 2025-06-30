const CustomException = require("../CustomException");

class NoFilesWereUploadedException extends CustomException {
  constructor() {
    super("NoFilesWereUploadedException");
  }
}

module.exports = NoFilesWereUploadedException;
