const { Flow } =  require("../models");

class FlowRepository {
   async create(flow) {
    return await Flow.create(flow);
  }

   async findByUid(uid) {
    return await Flow.findAll({ where: { uid } });
  }

   async findByFlowId(flow_id) {
    return await Flow.findOne({ where: { flow_id } });
  }

   async findByFlowIdAndUid(flow_id, uid) {
    return await Flow.findOne({ where: { flow_id, uid } });
  }

   async updateTitle(flow_id, title) {
    return await Flow.update({ title }, { where: { flow_id } });
  }

   async updateAiList(flow_id, ai_list) {
    return await Flow.update({ ai_list }, { where: { flow_id } });
  }

   async updatePreventList(flow_id, prevent_list) {
    return await Flow.update({ prevent_list }, { where: { flow_id } });
  }

   async delete(id, uid) {
    return await Flow.destroy({ where: { id, uid } });
  }

  async getNodesByFlowId(userId, flowId) {
    try {
      const query = `
        SELECT data FROM nodes 
        WHERE user_id = $1 AND flow_id = $2
      `;
      const result = await this.pool.query(query, [userId, flowId]);
      return result.rows.map((row) => row.data); 
    } catch (err) {
      throw new Error("Error fetching nodes: " + err.message);
    }
  }

  async getEdgesByFlowId(userId, flowId) {
    try {
      const query = `
        SELECT data FROM edges 
        WHERE user_id = $1 AND flow_id = $2
      `;
      const result = await this.pool.query(query, [userId, flowId]);
      return result.rows.map((row) => row.data); 
    } catch (err) {
      throw new Error("Error fetching edges: " + err.message);
    }
  }
}

module.exports = FlowRepository;
