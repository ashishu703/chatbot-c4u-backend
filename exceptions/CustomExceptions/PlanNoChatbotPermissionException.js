const CustomException = require("../CustomException");

class PlanNoChatbotPermissionException extends CustomException {
  constructor() {
    super("PlanNoChatbotPermissionException");
  }
}

module.exports = PlanNoChatbotPermissionException;
