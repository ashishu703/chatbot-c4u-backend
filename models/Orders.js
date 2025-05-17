"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    static associate(models) {
      Orders.belongsTo(models.User, { foreignKey: "uid", targetKey: "uid" });
    }
  }
  Orders.init(
    {
      uid: DataTypes.STRING,
      payment_mode: DataTypes.STRING,
      amount: DataTypes.STRING,
      data: DataTypes.TEXT,
      s_token: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Orders",
      tableName: "orders",
    }
  );
  return Orders;
};
