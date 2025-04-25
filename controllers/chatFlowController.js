const FlowService = require("../services/chatFlowService");

class FlowController {
  static async addFlow(req, res) {
    try {
      const { title, nodes, edges, flowId } = req.body;
      const user = req.decode;

      if (!title || !nodes || !edges || !flowId) {
        return res.json({ success: false, msg: "Missing required fields" });
      }

      const result = await FlowService.addFlow({ title, nodes, edges, flowId, user });
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getFlows(req, res) {
    try {
      const user = req.decode;
      const flows = await FlowService.getFlows(user.uid);
      res.json({ data: flows, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async deleteFlow(req, res) {
    try {
      const { id, flowId } = req.body;
      const user = req.decode;
      const result = await FlowService.deleteFlow(id, flowId, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getFlowById(req, res) {
    try {
      const { flowId } = req.body;
      const user = req.decode;

      if (!flowId) return res.json({ success: false, msg: "Flow id missing" });

      const result = await FlowService.getFlowById(flowId, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async getActivity(req, res) {
    try {
      const { flowId } = req.body;
      const user = req.decode;
      const result = await FlowService.getActivity(flowId, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async removeNumberFromActivity(req, res) {
    try {
      const { type, number, flowId } = req.body;
      const user = req.decode;
      const result = await FlowService.removeNumberFromActivity(type, number, flowId, user.uid);
      res.json(result);
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = FlowController;
