const CustomException = require("../CustomException");

class TaskNotFoundOrUnauthorizedException extends CustomException {
  constructor() {
    super("TaskNotFoundOrUnauthorizedException");
  }
}

module.exports = TaskNotFoundOrUnauthorizedException;
