const AgentService = require("../services/agentService");
const TypeCommentException = require("../exceptions/CustomExceptions/TypeCommentException");
class AgentTaskController {
  agentService;
  constructor() {
    this.agentService = new AgentService(); 
  }
   async getMyTasks(req, res, next) {
    try {
      const tasks = await this.agentService.getAgentTasks(req.decode.uid);
      res.json({ data: tasks, success: true });
    } catch (err) {
      next(err);
    }
  }

   async markTaskComplete(req, res, next) {
    try {
      const { id, comment } = req.body;
      if (!comment) {
        throw new TypeCommentException();
      }
      await this.agentService.markTaskComplete(id, comment);
      res.json({ msg: "Task updated", success: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = AgentTaskController;   