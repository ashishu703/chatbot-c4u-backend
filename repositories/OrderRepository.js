const { Order, User, Plan } = require("../models");
const Repository = require("./Repository");

class OrderRepository extends Repository {
  constructor() {
    super(Order);
  }
  async getOrders() {
    return this.find({
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
    return this.find();
  }

  async createOrder(orderData) {
    return this.create(orderData);
  }

  async updateOrder(data, updateData) {
    return this.update(updateData, { data });
  }

  async findOrderByData(data) {
    return this.findFirst({ where: { data } });
  }

  async findActiveOrderByUid(uid) {
    return this.findFirst({
      where: { uid },
      include: [{ model: Plan, as: "plan" }],
      order: [["createdAt", "DESC"]],
    });
  }
}

module.exports = OrderRepository;
