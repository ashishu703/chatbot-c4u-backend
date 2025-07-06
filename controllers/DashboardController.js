const AdminNotFoundException = require('../exceptions/CustomExceptions/AdminNotFoundException');
const UserNotFoundException = require('../exceptions/CustomExceptions/UserNotFoundException');
const DashboardService = require('../services/DashboardService');
const {formSuccess} = require("../utils/response.utils");
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
      return formSuccess(res,dashboardData);
    } catch (err) {
      next(err);
    }
  }

   async getAdminDashboard(req, res, next) {
    try {
      const admin = req.user;
      if (!admin || !admin.uid || admin.role !== 'admin') {
       throw new AdminNotFoundException();
      }

      const dashboardData = await this.dashboardService.getAdminDashboardData(admin.id, 'admin');
      return formSuccess(res,dashboardData);
    } catch (err) {
      next(err);
    }
  }

}

module.exports = DashboardController;
