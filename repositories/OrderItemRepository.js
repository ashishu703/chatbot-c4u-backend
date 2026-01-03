const { OrderItem } = require("../models");
const Repository = require("./Repository");

class OrderItemRepository extends Repository {
  constructor() {
    super(OrderItem);
  }

  async getItemsByOrderId(orderId) {
    return this.find({
      where: { order_id: orderId },
    });
  }

  async createOrderItem(data) {
    return this.create(data);
  }

  async createOrderItems(items) {
    return this.bulkCreate(items);
  }

  async deleteOrderItems(orderId) {
    return this.delete({ order_id: orderId });
  }
}

module.exports = OrderItemRepository;
