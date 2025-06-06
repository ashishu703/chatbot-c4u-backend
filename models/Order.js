"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Order extends Model {
    static associate(models) {
      Order.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
    }
  }
  Order.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order_id: DataTypes.STRING,
      order_status: DataTypes.STRING,
      order_type: DataTypes.STRING,
      order_date: DataTypes.STRING,
      payment_mode: DataTypes.STRING,
      amount: DataTypes.STRING,
      data: DataTypes.TEXT,
      s_token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Order",
      tableName: "orders",
    }
  );
  return Order;
};
