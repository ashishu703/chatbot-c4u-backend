const { Order, User } = require("../models/orders");

class OrderRepository {
  static async getOrders() {
    return await Order.findAll({
      include: [{ model: User, attributes: ["uid", "role", "name", "email", "password", "mobile_with_country_code", "timezone", "plan", "plan_expire", "trial", "api_key", "createdAt"] }],
    });
  }

  static async getRawOrders() {
    return await Order.findAll();
  }

 static async createOrder(orderData) {
    return await Orders.create(orderData);
  }

 static async updateOrder(data, updateData) {
    const order = await Orders.findOne({ where: { data } });
    if (order) {
      return await order.update(updateData);
    }
    return null;
  }

 static async findOrderByData(data) {
    return await Orders.findOne({ where: { data } });
  }

 static async findPlanById(id) {
    return await Plan.findByPk(id);
  }

  static async findActiveOrderByUid(uid) {
    const order = await Orders.findOne({
      where: { uid },
      include: [{ model: Plan, as: 'plan' }],
      order: [['createdAt', 'DESC']]
    });
    return order;
  }
}

module.exports = OrderRepository;