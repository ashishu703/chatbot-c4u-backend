const OrderRepository = require("../repositories/orderRepository");

class OrderController {
  static async getOrders(req, res) {
    try {
      const orders = await OrderRepository.getOrders();
      res.json({ data: orders, success: true });
    } catch (err) {
      console.error(err);
      res.json({ success: false, msg: "Server error" });
    }
  }
}

module.exports = OrderController;