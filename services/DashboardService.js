const UserRepository = require("../repositories/UserRepository");
const OrderRepository = require("../repositories/OrderRepository");
const ContactRepository = require("../repositories/ContactRepository");
const {
  getUserSignupsByMonth,
  getUserOrderssByMonth,
} = require("../functions/function");
const UserIdRequiredException = require("../exceptions/CustomExceptions/UserIdRequiredException");

class DashboardService {
  serRepository;
  orderRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.orderRepository = new OrderRepository();
    this.contactRepository = new ContactRepository();
  }

  async getDashboardData(userId, role) {
    if (!userId) {
      throw new UserIdRequiredException();
    }

    let dashboardData;

    if (role === "user") {
      dashboardData = await DashboardService.getUserDashboardData(userId);
    } else if (role === "admin") {
      dashboardData = await DashboardService.getAdminDashboardData();
    }

    return dashboardData;
  }
  async getUserDashboardData(userId) {
    const users = await this.userRepository.getUsers();
    const { paidSignupsByMonth, unpaidSignupsByMonth } =
      getUserSignupsByMonth(users);

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
      },
    };
  }

  async getAdminDashboardData() {
    const users = await this.userRepository.getUsers();
    const { paidSignupsByMonth, unpaidSignupsByMonth } =
      getUserSignupsByMonth(users);

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
      },
    };
  }
}

module.exports = DashboardService;
