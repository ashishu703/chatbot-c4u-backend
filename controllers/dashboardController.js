const DashboardService = require("../services/dashboardService");

class DashboardController {
  static async getDashboard(req, res) {
    try {
      const data = await DashboardService.getDashboardData();
      res.json({ data, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }
}

module.exports = DashboardController;