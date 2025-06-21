class FacebookException extends Error {
  status;
  type;

  constructor(message, type, statusCode) {
    super(message);
    this.status = statusCode;
    this.type = type;
  }
}

module.exports = FacebookException;
