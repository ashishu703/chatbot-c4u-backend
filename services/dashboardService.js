const UserRepository = require("../repositories/userRepository");
const OrderRepository = require("../repositories/orderRepository");
const ContactRepository = require("../repositories/contactRepository");
const { getUserSignupsByMonth, getUserOrderssByMonth } = require("../functions/function");

class DashboardService {
  static async getDashboardData() {
    const users = await UserRepository.getUsers();
    const { paidSignupsByMonth, unpaidSignupsByMonth } = getUserSignupsByMonth(users);
    const orders = await OrderRepository.getRawOrders();
    const ordersByMonth = getUserOrderssByMonth(orders);
    const contactForms = await ContactRepository.getContactLeads();
    return {
      paid: paidSignupsByMonth,
      unpaid: unpaidSignupsByMonth,
      orders: ordersByMonth,
      userLength: users.length,
      orderLength: orders.length,
      contactLength: contactForms.length,
    };
  }
}

module.exports = DashboardService;