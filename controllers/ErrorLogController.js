const ErrorLogService = require("../services/ErrorLogService");
const { formSuccess, formError } = require("../utils/response.utils");

class ErrorLogController {
  constructor() {
    this.errorLogService = new ErrorLogService();
  }

  async getErrorLogs(req, res, next) {
    try {
      const userId = req.user.id;
      const { limit, offset, platform, startDate, endDate } = req.query;

      const options = {
        limit: limit || 100,
        offset: offset || 0,
        platform,
        startDate,
        endDate,
      };

      const errorLogs = await this.errorLogService.getErrorLogs(userId, options);

      return formSuccess(res, {
        errorLogs,
        count: errorLogs.length,
      });
    } catch (error) {
      next(error);
    }
  }

  async getErrorStats(req, res, next) {
    try {
      const userId = req.user.id;
      const stats = await this.errorLogService.getErrorStats(userId);

      return formSuccess(res, stats);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = ErrorLogController;

