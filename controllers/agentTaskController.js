const AgentService = require("../services/agentService");

class AgentTaskController {
  static async getMyTasks(req, res) {
    try {
      const tasks = await AgentService.getAgentTasks(req.decode.uid);
      res.json({ data: tasks, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }

  static async markTaskComplete(req, res) {
    try {
      const { id, comment } = req.body;
      if (!comment) {
        return res.json({ msg: "Please type your comments." });
      }
      await AgentService.markTaskComplete(id, comment);
      res.json({ msg: "Task updated", success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: err.message || "Something went wrong" });
    }
  }
}

module.exports = AgentTaskController;   