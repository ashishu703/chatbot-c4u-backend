const path = require("path");
const FlowRepository = require("../repositories/chatFlowRepository");
const { writeJsonToFile, readJsonFromFile, deleteFileIfExists } = require("../functions/function");

class FlowService {
  static async addFlow({ title, nodes, edges, flowId, user }) {
    const basePath = path.join(__dirname, "../flow-json");
    const nodePath = `${basePath}/nodes/${user.uid}/${flowId}.json`;
    const edgePath = `${basePath}/edges/${user.uid}/${flowId}.json`;

    await writeJsonToFile(nodePath, nodes);
    await writeJsonToFile(edgePath, edges);

    const existingFlow = await FlowRepository.findByFlowId(flowId);
    if (existingFlow) {
      await FlowRepository.updateTitle(flowId, title);
    } else {
      await FlowRepository.create({ uid: user.uid, flow_id: flowId, title });
    }

    return { success: true, msg: "Flow was saved" };
  }

  static async getFlows(uid) {
    return await FlowRepository.findByUid(uid);
  }

  static async deleteFlow(id, flowId, uid) {
    const basePath = path.join(__dirname, "../flow-json");
    const nodePath = `${basePath}/nodes/${uid}/${flowId}.json`;
    const edgePath = `${basePath}/edges/${uid}/${flowId}.json`;

    await FlowRepository.delete(id, uid);
    deleteFileIfExists(nodePath);
    deleteFileIfExists(edgePath);

    return { success: true, msg: "Flow was deleted" };
  }

  static async getFlowById(flowId, uid) {
    const basePath = path.join(__dirname, "../flow-json");
    const nodePath = `${basePath}/nodes/${uid}/${flowId}.json`;
    const edgePath = `${basePath}/edges/${uid}/${flowId}.json`;

    const nodes = readJsonFromFile(nodePath);
    const edges = readJsonFromFile(edgePath);

    return { nodes, edges, success: true };
  }

  static async getActivity(flowId, uid) {
    const flow = await FlowRepository.findByFlowIdAndUid(flowId, uid);
    if (!flow) throw new Error("Flow not found");

    const prevent = flow.prevent_list || [];
    const ai = flow.ai_list || [];

    const preventWithIds = prevent.map((item, index) => ({ ...item, id: `prevent-${index}` }));
    const aiWithIds = ai.map((item, index) => ({ ...item, id: `ai-${index}` }));

    return { success: true, prevent: preventWithIds, ai: aiWithIds };
  }

  static async removeNumberFromActivity(type, number, flowId, uid) {
    const flow = await FlowRepository.findByFlowId(flowId);
    if (!flow) throw new Error("Flow not found");

    if (type === "AI") {
      const aiArr = flow.ai_list || [];
      const updatedArr = aiArr.filter((x) => x.senderNumber !== number);
      await FlowRepository.updateAiList(flowId, updatedArr);
    } else if (type === "DISABLED") {
      const preventArr = flow.prevent_list || [];
      const updatedArr = preventArr.filter((x) => x.senderNumber !== number);
      await FlowRepository.updatePreventList(flowId, updatedArr);
    }

    return { success: true, msg: "Number was removed" };
  }
}

module.exports = FlowService;
