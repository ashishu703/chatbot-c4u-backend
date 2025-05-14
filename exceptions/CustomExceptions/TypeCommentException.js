const CustomException = require("../CustomException");

class TypeCommentException extends CustomException {
  constructor() {
    super("TypeCommentException");
  }
}

module.exports = TypeCommentException;
