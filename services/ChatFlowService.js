const FlowRepository = require("../repositories/chatFlowRepository");
const FlowNotfoundException = require("../exceptions/customExceptions/FlowNotfoundException");
const FlowEdgeRepository = require("../repositories/FlowEdgeRepository");
const FlowNodeRepository = require("../repositories/FlowNodeRepository");
const { DISABLED, AI } = require("../types/flow.types");
class FlowService {
  constructor() {
    this.flowRepository = new FlowRepository();
    this.nodeRepository = new FlowNodeRepository();
    this.edgeRepository = new FlowEdgeRepository();
  }
  async addFlow({ title, nodes, edges, flowId, user }) {

    const flow = await this.flowRepository.updateOrCreate({
      uid: user.uid,
      flow_id: flowId,
      title,
    }, {
      flow_id: flowId,
      uid: user.uid
    });

    for (const node of nodes) {
      this.nodeRepository.create({
        "node_id": node.id,
        "flow_id": flow.id,
        "type": node.type,
        "node_type": node.nodeType,
        "data": JSON.stringify(node.data),
        "position": JSON.stringify(node.position),
        "position_absolute": JSON.stringify(node.positionAbsolute),
        "uid": user.uid,
      });
    };

    for (const edge of edges) {
      this.edgeRepository.create({
        "flow_id": flow.id,
        "edge_id": edge.id,
        "source": edge.source,
        "source_handle": edge.sourceHandle,
        "uid": user.uid,
        "target": edge.target,
        "target_handle": edge.targetHandle,
        "uid": user.uid,
      });
    };

    return flow;
  }
  async getFlows(query) {
    return await this.flowRepository.paginate(query);
  }

  async deleteFlow(id) {
    return this.flowRepository.delete({
      id
    });
  }

  async getFlowById(id) {
    return this.flowRepository.find({
      id
    }, ["nodes", "edges"]);
  }

  async getActivity(flowId, uid) {
    const flow = await this.flowRepository.findByFlowIdAndUid(flowId, uid);
    if (!flow) throw new FlowNotfoundException();

    const prevent = flow.prevent_list || [];
    const ai = flow.ai_list || [];

    const preventWithIds = prevent.map((item, index) => ({
      ...item,
      id: `prevent-${index}`,
    }));

    const aiWithIds = ai.map((item, index) => ({ ...item, id: `ai-${index}` }));

    return { prevent: preventWithIds, ai: aiWithIds };
  }

  async removeNumberFromActivity(type, number, flowId, uid) {
    const flow = await this.flowRepository.findByFlowId(flowId);
    if (!flow) throw new FlowNotfoundException();

    if (type === AI) {
      const aiArr = flow.ai_list || [];
      const updatedArr = aiArr.filter((x) => x.senderNumber !== number);
      return this.flowRepository.updateAiList(flowId, updatedArr);
    } else if (type === DISABLED) {
      const preventArr = flow.prevent_list || [];
      const updatedArr = preventArr.filter((x) => x.senderNumber !== number);
      return this.flowRepository.updatePreventList(flowId, updatedArr);
    }

    return flow;
  }
}

module.exports = FlowService;
