const OrderRepository = require("../repositories/orderRepository");
const { formSuccess } = require("../utils/response.utils");

class OrderController {
  orderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async getOrders(req, res, next) {
    try {
      const orders = await this.orderRepository.getOrders();
      return formSuccess({ data: orders });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
