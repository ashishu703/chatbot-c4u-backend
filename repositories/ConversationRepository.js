const { FlowEdge } = require("../models");
const Repository = require("./Repository");

class ConversationRepository extends Repository {

  constructor() {
    super(FlowEdge);
  }

};
module.exports = ConversationRepository