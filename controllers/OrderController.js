const OrderRepository = require("../repositories/OrderRepository");
const { formSuccess } = require("../utils/response.utils");

class OrderController {
  orderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async getOrders(req, res, next) {
    try {
      const query = req.query;
      const orders = await this.orderRepository.getOrders(query);
      return formSuccess(res, orders);
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
