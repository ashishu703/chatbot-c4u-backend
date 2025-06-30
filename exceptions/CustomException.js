const CustomExceptionMessages = require("../messages/CustomExceptionMessages");

class CustomException extends Error {
  status;
  type;

  constructor(type = "CustomException") {
    const message = CustomExceptionMessages.getMessages(type).message;
    const status = CustomExceptionMessages.getMessages(type).statusCode;
    super(message);
    this.status = status;
    this.type = type;
  }
}

module.exports = CustomException;
