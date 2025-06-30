const CustomException = require("../CustomException");

class ProvideExampleArrArrayException extends CustomException {
  constructor() {
    super("ProvideExampleArrArrayException");
  }
}

module.exports = ProvideExampleArrArrayException;
