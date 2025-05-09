const FlowService = require("../services/chatFlowService");

class FlowController {
  flowService;
  constructor() {
    this.flowService = new FlowService();
  }
   async addFlow(req, res) {
    try {
      const { title, nodes, edges, flowId } = req.body;
      const user = req.decode;

      if (!title || !nodes || !edges || !flowId) {
        return res.json({ success: false, msg: "Missing required fields" });
      }

      const result = await this.flowService.addFlow({ title, nodes, edges, flowId, user });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async getFlows(req, res) {
    try {
      const user = req.decode;
      const flows = await this.flowService.getFlows(user.uid);
      res.json({ data: flows, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async deleteFlow(req, res) {
    try {
      const { id, flowId } = req.body;
      const user = req.decode;
      const result = await this.flowService.deleteFlow(id, flowId, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  async getByFlowId(req, res) {
    try {
      const { flowId } = req.body;

      if (!flowId) {
        return res.status(400).json({ success: false, msg: "Flow id missing" });
      }

      const { nodes, edges } = await this.flowService.getFlowById(
        req.decode.uid,
        flowId
      );

      res.json({ nodes, edges, success: true });
    } catch (err) {
      console.error(err);
      res.status(500).json({ success: false, msg: "Something went wrong" });
    }
  }


   async getActivity(req, res) {
    try {
      const { flowId } = req.body;
      const user = req.decode;
      const result = await this.flowService.getActivity(flowId, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

   async removeNumberFromActivity(req, res) {
    try {
      const { type, number, flowId } = req.body;
      const user = req.decode;
      const result = await this.flowService.removeNumberFromActivity(type, number, flowId, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = FlowController;
