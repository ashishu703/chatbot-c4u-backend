const DashboardService = require('../services/dashboardService');

class DashboardController {
  dashboardService;
  constructor(){
    this.dashboardService = new DashboardService();
  }
   async getUserDashboard(req, res) {
    try {
      const user = req.user;  
      if (!user || !user.id) {
        return res.status(400).json({ message: "User not found or invalid user data" });
      }

      const dashboardData = await this.dashboardService.getDashboardData(user.id, 'user');
      return res.json(dashboardData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to get dashboard data", error: error.message });
    }
  }

   async getAdminDashboard(req, res) {
    try {
      const admin = req.user;
      if (!admin || !admin.id || admin.role !== 'admin') {
        return res.status(400).json({ message: "Admin not found or invalid admin data" });
      }

      const dashboardData = await this.dashboardService.getDashboardData(admin.id, 'admin');
      return res.json(dashboardData);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Failed to get dashboard data", error: error.message });
    }
  }

}

module.exports = DashboardController;
