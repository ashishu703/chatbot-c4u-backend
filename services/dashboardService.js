const UserRepository = require("../repositories/UserRepository");
const OrderRepository = require("../repositories/orderRepository");
const ContactRepository = require("../repositories/ContactRepository");
const { getUserSignupsByMonth, getUserOrderssByMonth } = require("../functions/function");

class DashboardService {
  serRepository;
  orderRepository;
  constructor(){
    this.userRepository = new UserRepository();
    this.orderRepository = new OrderRepository();
    this.contactRepository = new ContactRepository();
  }

   async getDashboardData(userId, role) {
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
   async getUserDashboardData(userId) {
    try {
      const users = await this.userRepository.getUsers();
      const { paidSignupsByMonth, unpaidSignupsByMonth } = getUserSignupsByMonth(users);

      const orders = await this.orderRepository.getRawOrders();
      const ordersByMonth = getUserOrderssByMonth(orders);

      const contactForms = await this.contactRepository.getPhonebooksByUid();

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

   async getAdminDashboardData() {
    try {
      const users = await this.userRepository.getUsers();
      const { paidSignupsByMonth, unpaidSignupsByMonth } = getUserSignupsByMonth(users);

      const orders = await this.orderRepository.getRawOrders();
      const ordersByMonth = getUserOrderssByMonth(orders);

      const contactForms = await this.contactRepository.getPhonebooksByUid();

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
