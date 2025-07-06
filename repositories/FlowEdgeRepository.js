const { FlowEdge } = require("../models");
const Repository = require("./Repository");
const { INITIAL_MESSAGE } = require("../types/specified-messages.types");

class FlowEdgeRepository extends Repository {

  constructor() {
    super(FlowEdge);
  }


  async findEdgeWithTargetNode(flowId, sourceHandle) {
    return this.model.findOne({
      where: {
        flow_id: flowId,
        source_handle: sourceHandle,
      },
      include: ["targetNode"],
    });
  }

  async findEdgeUsingSourceWithTargetNode(flowId, sourceId) {
    return this.model.findOne({
      where: {
        flow_id: flowId,
        source: sourceId,
      },
      include: ["targetNode"],
    });
  }


  async findFirstEdgeWithTargetNode(flowId) {
    return this.model.findOne({
      where: {
        flow_id: flowId,
        source_handle: INITIAL_MESSAGE,
      },
      include: ["targetNode"],
    });
  }

};
module.exports = FlowEdgeRepository