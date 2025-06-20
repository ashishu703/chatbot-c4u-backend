const UserRepository = require("../repositories/UserRepository");
const OrderRepository = require("../repositories/OrderRepository");
const ContactRepository = require("../repositories/ContactRepository");
const AdminRepository = require("../repositories/AdminRepository");
const {
  getUserSignupsByMonth,
  getUserOrderssByMonth,
} = require("../utils/statistics.utils");
const UserIdRequiredException = require("../exceptions/CustomExceptions/UserIdRequiredException");
const { ADMIN, USER } = require("../types/roles.types");

class DashboardService {
  serRepository;
  orderRepository;
  adminRepository;
  constructor() {
    this.userRepository = new UserRepository();
    this.orderRepository = new OrderRepository();
    this.contactRepository = new ContactRepository();
    this.adminRepository = new AdminRepository();
  }

  async getDashboardData(userId, role) {
    if (!userId) {
      throw new UserIdRequiredException();
    }

    let dashboardData;

    if (role === USER) {
      dashboardData = await this.getUserDashboardData(userId);
    } else if (role === ADMIN) {
      dashboardData = await this.getAdminDashboardData();
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
      paidSignupsByMonth,
      unpaidSignupsByMonth,
      ordersByMonth,
      userLength: users.length,
      orderLength: orders.length,
      contactLength: contactForms.length,
    };
  }

  async getAdminDashboardData() {
    const { paidSignupsByMonth, unpaidSignupsByMonth, totalUsers } =
      await getUserSignupsByMonth();

    const ordersByMonth = await getUserOrderssByMonth();

    const contactForms = await this.contactRepository.count();

    return {
      paidSignupsByMonth,
      unpaidSignupsByMonth,
      ordersByMonth,
      totalUsers: totalUsers,
      totalOrders: ordersByMonth.totalOrders,
      totalContacts: contactForms,
    };
  }
}

module.exports = DashboardService;
