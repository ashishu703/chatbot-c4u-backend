
const CustomException = require("../CustomException");

class TypeTagException extends CustomException {
  constructor() {
    super("TypeTagException");
  }
}

module.exports = TypeTagException;
