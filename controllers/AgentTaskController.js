const AgentService = require("../services/AgentService");
const TypeCommentException = require("../exceptions/CustomExceptions/TypeCommentException");
const { formSuccess } = require("../utils/response.utils");
const { __t } = require("../utils/locale.utils");
const { where } = require("sequelize");
class AgentTaskController {
  agentService;
  constructor() {
    this.agentService = new AgentService();
  }
  async getMyTasks(req, res, next) {
    try {
      const query = req.query;
      const tasks = await this.agentService.getAgentTasks({
        where: {
          uid: req.decode.uid
        },
        ...query
      });
      return formSuccess(res, tasks);
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

      return formSuccess(res, {
        msg: __t("task_updated"),
      });
    } catch (err) {
      next(err);
    }
  }

}

module.exports = AgentTaskController;   