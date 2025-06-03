const { FlowNode } = require("../models");
const Repository = require("./Repository");

class FlowNodeRepository extends Repository {

  constructor() {
    super(FlowNode);
  }

};
module.exports = FlowNodeRepository