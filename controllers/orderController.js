const OrderRepository = require("../repositories/orderRepository");

class OrderController {
  orderRepository;

  constructor() {
    this.orderRepository = new OrderRepository();
  }

  async getOrders(req, res) {
    try {
      const orders = await this.orderRepository.getOrders();
      res.json({ data: orders, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }
}

module.exports = OrderController;
