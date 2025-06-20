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
