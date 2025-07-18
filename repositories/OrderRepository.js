const { Order, Plan } = require("../models");
const Repository = require("./Repository");

class OrderRepository extends Repository {
  constructor() {
    super(Order);
  }
  async getOrders(query) {
    return this.paginate(query);
  }

  async getRawOrders() {
    return this.find();
  }

  async createOrder(uid, payment_mode, amount, orderID) {
    return this.create({
      uid,
      payment_mode,
      amount,
      data: orderID,
    });
  }


  async findById(planId) {
    return Plan.findByPk(planId);
  }

  async findOrderByData(orderToken) {
  return Order.findOne({ where: { data: orderToken } }); 
}
async updateOrder(orderToken, data) {
  return Order.update(data, { where: { data: orderToken } }); 
}

  async findActiveOrderByUid(uid) {
    return this.findFirst({
      where: { uid },
      include: [{ model: Plan, as: "plan" }],
      order: [["createdAt", "DESC"]],
    });
  }

  async updateTokenByOrderId(orderID, token) {
    return this.model.update({ s_token: token }, { where: { data: orderID } });
  }
}

module.exports = OrderRepository;
