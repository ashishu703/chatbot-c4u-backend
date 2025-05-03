const UserRepository = require("../repositories/UserRepository");
const OrderRepository = require("../repositories/orderRepository");
const ContactRepository = require("../repositories/contactRepository");
const { getUserSignupsByMonth, getUserOrderssByMonth } = require("../functions/function");

class DashboardService {

  static async getDashboardData(userId, role) {
    try {
      if (!userId) {
        throw new Error("User ID is required");
      }

      let dashboardData;
      
      if (role === 'user') {
        dashboardData = await DashboardService.getUserDashboardData(userId);
      }
      else if (role === 'admin') {
        dashboardData = await DashboardService.getAdminDashboardData();
      }
      
      return dashboardData;
    } catch (error) {
      throw new Error(error.message);
    }
  }
  static async getUserDashboardData(userId) {
    try {
      const users = await UserRepository.getUsers();
      const { paidSignupsByMonth, unpaidSignupsByMonth } = getUserSignupsByMonth(users);

      const orders = await OrderRepository.getRawOrders();
      const ordersByMonth = getUserOrderssByMonth(orders);

      const contactForms = await ContactRepository.getPhonebooksByUid();

      return {
        success: true,
        data: {
          paidSignupsByMonth,
          unpaidSignupsByMonth,
          ordersByMonth,
          userLength: users.length,
          orderLength: orders.length,
          contactLength: contactForms.length,
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

  static async getAdminDashboardData() {
    try {
      const users = await UserRepository.getUsers();
      const { paidSignupsByMonth, unpaidSignupsByMonth } = getUserSignupsByMonth(users);

      const orders = await OrderRepository.getRawOrders();
      const ordersByMonth = getUserOrderssByMonth(orders);

      const contactForms = await ContactRepository.getPhonebooksByUid();

      return {
        success: true,
        data: {
          paidSignupsByMonth,
          unpaidSignupsByMonth,
          ordersByMonth,
          totalUsers: users.length,
          totalOrders: orders.length,
          totalContacts: contactForms.length,
        }
      };
    } catch (error) {
      throw new Error(error.message);
    }
  }

}

module.exports = DashboardService;
