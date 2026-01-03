const BroadcastLogRepository = require("../repositories/BroadcastLogRepository");
const { BroadcastLog } = require("../models");
const { Op } = require("sequelize");

class ErrorLogService {
  constructor() {
    this.broadcastLogRepository = new BroadcastLogRepository();
  }

  async getErrorLogs(userId, options = {}) {
    const { limit = 100, offset = 0, platform, startDate, endDate } = options;

    try {
      // Get user's UID from userId
      const { User } = require("../models");
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const whereClause = {
        uid: user.uid,
        delivery_status: "failed",
        err: {
          [Op.ne]: null,
        },
      };

      // Add date filters if provided
      if (startDate || endDate) {
        whereClause.delivery_time = {};
        if (startDate) {
          whereClause.delivery_time[Op.gte] = new Date(startDate);
        }
        if (endDate) {
          whereClause.delivery_time[Op.lte] = new Date(endDate);
        }
      }

      // Get failed broadcast logs
      const failedLogs = await BroadcastLog.findAll({
        where: whereClause,
        order: [["delivery_time", "DESC"]],
        limit: parseInt(limit),
        offset: parseInt(offset),
      });

      // Format error logs
      const errorLogs = failedLogs.map((log) => {
        let errData = {};
        
        if (typeof log.err === "string") {
          try {
            errData = JSON.parse(log.err);
          } catch {
            errData = { message: log.err };
          }
        } else if (log.err) {
          errData = log.err;
        }
        
        // Extract error code and message - handle Meta API error format
        let errorCode = errData.code || errData.error?.code || errData.error?.subcode || errData.error_code || errData.error?.error_subcode || "N/A";
        let errorMessage = errData.message || errData.error?.message || errData.error_message || errData.error?.error_user_msg || errData.error?.error_message || String(log.err || "Unknown error");
        
        // If error is a nested object, try to extract more details
        if (errData.error) {
          if (errData.error.subcode || errData.error.error_subcode) {
            errorCode = errData.error.subcode || errData.error.error_subcode;
          }
          if (errData.error.error_user_msg) {
            errorMessage = errData.error.error_user_msg;
          } else if (errData.error.error_message) {
            errorMessage = errData.error.error_message;
          } else if (errData.error.message) {
            errorMessage = errData.error.message;
          }
        }

        // Determine platform from sender_id or error data
        let platform = "Unknown";
        
        // Try to get platform from error data first
        if (errData.platform) {
          platform = errData.platform;
        } else if (log.sender_id) {
          // Try to determine from sender_id format
          const senderIdLower = String(log.sender_id).toLowerCase();
          if (senderIdLower.includes("whatsapp") || senderIdLower.includes("wa") || senderIdLower.includes("waba")) {
            platform = "Whatsapp";
          } else if (senderIdLower.includes("messenger") || senderIdLower.includes("fb") || senderIdLower.includes("facebook")) {
            platform = "Messenger";
          } else if (senderIdLower.includes("instagram") || senderIdLower.includes("ig")) {
            platform = "Instagram";
          }
        }
        
        // If still unknown, try to infer from error message
        if (platform === "Unknown" && errorMessage) {
          const errorLower = String(errorMessage).toLowerCase();
          if (errorLower.includes("whatsapp") || errorLower.includes("wa")) {
            platform = "Whatsapp";
          } else if (errorLower.includes("messenger") || errorLower.includes("facebook")) {
            platform = "Messenger";
          } else if (errorLower.includes("instagram")) {
            platform = "Instagram";
          }
        }

        return {
          id: log.id,
          errorCode: String(errorCode),
          platform: platform,
          recipient: log.send_to || "N/A",
          errorMessage: errorMessage,
          date: log.delivery_time ? new Date(log.delivery_time).toLocaleString() : new Date(log.createdAt).toLocaleString(),
          timestamp: log.delivery_time || log.createdAt,
          type: "broadcast",
          broadcastId: log.broadcast_id,
          templateName: log.templet_name,
        };
      });

      return errorLogs;
    } catch (error) {
      console.error("Error fetching error logs:", error);
      throw error;
    }
  }

  async getErrorStats(userId) {
    try {
      const { User } = require("../models");
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error("User not found");
      }

      // Get total failed logs
      const totalErrors = await BroadcastLog.count({
        where: {
          uid: user.uid,
          delivery_status: "failed",
          err: {
            [Op.ne]: null,
          },
        },
      });

      // Get broadcast errors (all failed logs are broadcast errors in this case)
      const broadcastErrors = totalErrors;

      // Message errors would be from regular messages, but we're focusing on broadcast logs
      // For now, message errors = 0, but this can be extended later
      const messageErrors = 0;

      return {
        totalErrors,
        broadcastErrors,
        messageErrors,
      };
    } catch (error) {
      console.error("Error fetching error stats:", error);
      throw error;
    }
  }
}

module.exports = ErrorLogService;

