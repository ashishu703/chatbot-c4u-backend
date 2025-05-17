class HttpException extends Error {
  constructor(message, status) {
    super(message);
    this.status = status || 500; // Default to 500 if no status is provided
    this.name = "HttpException"; // Set error name for easier identification
  }
}

module.exports = HttpException;
