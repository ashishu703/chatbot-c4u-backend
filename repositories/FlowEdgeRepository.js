const { FlowEdge } = require("../models");
const Repository = require("./Repository");

class FlowEdgeRepository extends Repository {

  constructor() {
    super(FlowEdge);
  }

};
module.exports = FlowEdgeRepository