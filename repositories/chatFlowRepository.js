const { Flow } = require("../models/flow");

class FlowRepository {
  static async create(flow) {
    return await Flow.create(flow);
  }

  static async findByUid(uid) {
    return await Flow.findAll({ where: { uid } });
  }

  static async findByFlowId(flow_id) {
    return await Flow.findOne({ where: { flow_id } });
  }

  static async findByFlowIdAndUid(flow_id, uid) {
    return await Flow.findOne({ where: { flow_id, uid } });
  }

  static async updateTitle(flow_id, title) {
    return await Flow.update({ title }, { where: { flow_id } });
  }

  static async updateAiList(flow_id, ai_list) {
    return await Flow.update({ ai_list }, { where: { flow_id } });
  }

  static async updatePreventList(flow_id, prevent_list) {
    return await Flow.update({ prevent_list }, { where: { flow_id } });
  }

  static async delete(id, uid) {
    return await Flow.destroy({ where: { id, uid } });
  }
}

module.exports = FlowRepository;
