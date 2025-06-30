const FlowRepository = require("../repositories/FlowRepository");
const FlowNotfoundException = require("../exceptions/customExceptions/FlowNotfoundException");
const FlowEdgeRepository = require("../repositories/FlowEdgeRepository");
const FlowNodeRepository = require("../repositories/FlowNodeRepository");
const { DISABLED, AI } = require("../types/flow.types");
const { formatNodesForFlow, formatEdgesForFlow } = require("../utils/flow.utils");
class FlowService {
  constructor() {
    this.flowRepository = new FlowRepository();
    this.nodeRepository = new FlowNodeRepository();
    this.edgeRepository = new FlowEdgeRepository();
  }
  async addFlow({ title, nodes, edges, flowId, uid }) {

    const flow = await this.flowRepository.updateOrCreate({
      uid: uid,
      flow_id: flowId,
      title,
    }, {
      flow_id: flowId,
      uid: uid
    });

    for (const node of nodes) {
      await this.nodeRepository.updateOrCreate({
        "node_id": node.id,
        "flow_id": flow.id,
        "node_type": node.nodeType,
        "data": node.data,
        "position": node.position,
        "uid": uid,
      }, {
        "uid": uid,
        "node_id": node.id,
      });
    };

    for (const edge of edges) {
      await this.edgeRepository.updateOrCreate({
        "flow_id": flow.id,
        "edge_id": edge.id,
        "source": edge.source,
        "source_handle": edge.sourceHandle,
        "uid": uid,
        "target": edge.target,
      }, {
        "uid": uid,
        "edge_id": edge.id,
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

  async getFlowById(uid, flowId) {
    const flow = await this.flowRepository.findFirst({
      where: {
        uid,
        flow_id: flowId
      }
    }, ["nodes", "edges"]);


    const {nodes, edges} = flow;
    
    const formattedNodes = formatNodesForFlow(nodes);
    const formattedEdges = formatEdgesForFlow(edges);
    
    return {
      ...flow,
      nodes: formattedNodes,
      edges: formattedEdges
    }
    
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
