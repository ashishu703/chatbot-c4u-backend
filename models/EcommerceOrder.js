"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class EcommerceOrder extends Model {
    static associate(models) {
      EcommerceOrder.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
      EcommerceOrder.belongsTo(models.Catalog, {
        foreignKey: "catalog_id",
        as: "catalog",
      });
      EcommerceOrder.hasMany(models.OrderItem, {
        foreignKey: "order_id",
        as: "items",
      });
    }
  }
  EcommerceOrder.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      order_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      catalog_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "catalogs",
          key: "id",
        },
      },
      customer_phone: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      customer_name: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("pending", "confirmed", "shipped", "delivered", "cancelled"),
        defaultValue: "pending",
      },
      payment_status: {
        type: DataTypes.ENUM("pending", "paid", "failed", "refunded"),
        defaultValue: "pending",
      },
      total: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },
      shipping_address: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
      payment_method: {
        type: DataTypes.STRING,
      },
      meta_data: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: "EcommerceOrder",
      tableName: "ecommerce_orders",
      timestamps: true,
    }
  );
  return EcommerceOrder;
};

