const AdminNotFoundException = require('../exceptions/CustomExceptions/AdminNotFoundException');
const UserNotFoundException = require('../exceptions/CustomExceptions/UserNotFoundException');
const DashboardService = require('../services/dashboardService');

class DashboardController {
  dashboardService;
  constructor(){
    this.dashboardService = new DashboardService();
  }
   async getUserDashboard(req, res, next) {
    try {
      const user = req.user;  
      if (!user || !user.id) {
        throw new UserNotFoundException();
      }

      const dashboardData = await this.dashboardService.getDashboardData(user.id, 'user');
      return res.json(dashboardData);
    } catch (err) {
      next(err);
    }
  }

   async getAdminDashboard(req, res, next) {
    try {
      const admin = req.user;
      if (!admin || !admin.id || admin.role !== 'admin') {
       throw new AdminNotFoundException();
      }

      const dashboardData = await this.dashboardService.getDashboardData(admin.id, 'admin');
      return res.json(dashboardData);
    } catch (err) {
      next(err);
    }
  }

}

module.exports = DashboardController;
