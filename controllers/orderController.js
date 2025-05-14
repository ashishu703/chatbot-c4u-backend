const OrderRepository = require("../repositories/orderRepository");

class OrderController {
  orderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async getOrders(req, res, next) {
    try {
      const orders = await this.orderRepository.getOrders();
      res.json({ data: orders, success: true });
    } catch (err) {
      next(err);
    }
  }
}

module.exports = OrderController;
