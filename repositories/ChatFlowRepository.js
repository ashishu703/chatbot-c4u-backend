const { Flow } = require("../models");
const Repository = require("./Repository");

class FlowRepository extends Repository {
  constructor() {
    super(Flow);
  }


  async findByFlowId(flow_id) {
    return this.findFirst({ where: { flow_id } });
  }

  async findByFlowIdAndUid(flow_id, uid) {
    return this.findFirst({ where: { flow_id, uid } });
  }

  async updateTitle(flow_id, title) {
    return this.update({ title }, { flow_id });
  }

  async updateAiList(flow_id, ai_list) {
    return this.update({ ai_list }, { flow_id });
  }

  async updatePreventList(flow_id, prevent_list) {
    return this.update({ prevent_list }, { flow_id });
  }



}

module.exports = FlowRepository;
