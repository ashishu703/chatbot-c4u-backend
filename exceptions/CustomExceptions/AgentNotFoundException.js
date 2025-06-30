const CustomException = require("../CustomException");

class AgentNotFoundException extends CustomException {
  constructor() {
    super("AgentNotFoundException");
  }
}

module.exports = AgentNotFoundException;
