const { Orders, User } = require("../models");

class OrderRepository {
  async getOrders() {
    return await Orders.findAll({
      include: [
        {
          model: User,
          attributes: [
            "uid",
            "role",
            "name",
            "email",
            "password",
            "mobile_with_country_code",
            "timezone",
            "plan",
            "plan_expire",
            "trial",
            "api_key",
            "createdAt",
          ],
        },
      ],
    });
  }

  async getRawOrders() {
    return await Orders.findAll();
  }

  async createOrder(orderData) {
    return await Orders.create(orderData);
  }

  async updateOrder(data, updateData) {
    const order = await Orders.findOne({ where: { data } });
    if (order) {
      return await order.update(updateData);
    }
    return null;
  }

  async findOrderByData(data) {
    return await Orders.findOne({ where: { data } });
  }

  async findPlanById(id) {
    return await Plan.findByPk(id);
  }

  async findActiveOrderByUid(uid) {
    const order = await Orders.findOne({
      where: { uid },
      include: [{ model: Plan, as: "plan" }],
      order: [["createdAt", "DESC"]],
    });
    return order;
  }
}

module.exports = OrderRepository;
