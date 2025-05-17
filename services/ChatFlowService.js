const path = require("path");
const FlowRepository = require("../repositories/chatFlowRepository");
const {
  writeJsonToFile,
  readJsonFromFile,
  deleteFileIfExists,
} = require("../functions/function");
const FlowNotfoundException = require("../exceptions/customExceptions/FlowNotfoundException");
class FlowService {
  constructor() {
    this.flowRepository = new FlowRepository();
  }
  async addFlow({ title, nodes, edges, flowId, user }) {
    const basePath = path.join(__dirname, "../flow-json");
    const nodePath = `${basePath}/nodes/${user.uid}/${flowId}.json`;
    const edgePath = `${basePath}/edges/${user.uid}/${flowId}.json`;

    await writeJsonToFile(nodePath, nodes);
    await writeJsonToFile(edgePath, edges);

    const existingFlow = await this.flowRepository.findByFlowId(flowId);
    if (existingFlow) {
      await this.flowRepository.updateTitle(flowId, title);
    } else {
      await this.flowRepository.create({
        uid: user.uid,
        flow_id: flowId,
        title,
      });
    }

    return true;
  }
  async getFlows(uid) {
    return await this.flowRepository.findByUid(uid);
  }

  async deleteFlow(id, flowId, uid) {
    const basePath = path.join(__dirname, "../flow-json");
    const nodePath = `${basePath}/nodes/${uid}/${flowId}.json`;
    const edgePath = `${basePath}/edges/${uid}/${flowId}.json`;

    await this.flowRepository.delete(id, uid);
    deleteFileIfExists(nodePath);
    deleteFileIfExists(edgePath);

    return true;
  }

  async getFlowById(flowId, uid) {
    const basePath = path.join(__dirname, "../flow-json");
    const nodePath = `${basePath}/nodes/${flowId}/${uid}.json`;
    const edgePath = `${basePath}/edges/${flowId}/${uid}.json`;

    const nodes = await readJsonFromFile(nodePath);
    const edges = await readJsonFromFile(edgePath);

    return { nodes, edges };
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

    if (type === "AI") {
      const aiArr = flow.ai_list || [];
      const updatedArr = aiArr.filter((x) => x.senderNumber !== number);
      await this.flowRepository.updateAiList(flowId, updatedArr);
    } else if (type === "DISABLED") {
      const preventArr = flow.prevent_list || [];
      const updatedArr = preventArr.filter((x) => x.senderNumber !== number);
      await this.flowRepository.updatePreventList(flowId, updatedArr);
    }

    return true;
  }
}

module.exports = FlowService;
