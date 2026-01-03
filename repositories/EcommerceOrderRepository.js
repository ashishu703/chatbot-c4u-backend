const { EcommerceOrder, OrderItem } = require("../models");
const Repository = require("./Repository");

class EcommerceOrderRepository extends Repository {
  constructor() {
    super(EcommerceOrder);
  }

  async getOrdersByUid(uid, filters = {}) {
    const where = { uid };
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.payment_status) {
      where.payment_status = filters.payment_status;
    }

    return this.paginate({
      where,
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
      order: [["createdAt", "DESC"]],
      page: filters.page || 1,
      limit: filters.limit || 10,
    });
  }

  async getOrderById(id, uid) {
    return this.findFirst({
      where: { id, uid },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });
  }

  async getOrderByOrderId(orderId, uid) {
    return this.findFirst({
      where: { order_id: orderId, uid },
      include: [
        {
          model: OrderItem,
          as: "items",
        },
      ],
    });
  }

  async createOrder(data) {
    return this.create(data);
  }

  async updateOrderStatus(id, uid, status) {
    return this.update({ status }, { id, uid });
  }

  async updateOrderPaymentStatus(id, uid, payment_status) {
    return this.update({ payment_status }, { id, uid });
  }

  async updateOrder(id, uid, data) {
    return this.update(data, { id, uid });
  }
}

module.exports = EcommerceOrderRepository;
