"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class OrderSettings extends Model {
    static associate(models) {
      OrderSettings.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
        unique: true,
      });
    }
  }
  OrderSettings.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      payment_methods: {
        type: DataTypes.JSONB,
        defaultValue: {
          cod: { enabled: false, minAmount: 0, maxAmount: "No limit" },
          razorpay: { enabled: false },
          upi: { enabled: false },
        },
      },
      shipping: {
        type: DataTypes.JSONB,
        defaultValue: {
          standard: { enabled: false, deliveryTime: "3-5 business days", charges: 50 },
        },
      },
      checkout: {
        type: DataTypes.JSONB,
        defaultValue: {
          addressCollection: {
            enabled: false,
            method: "Interactive (Buttons/Quick Replies)",
            requiredFields: {},
            optionalFields: {},
          },
          autoConfirm: false,
          minOrderAmount: 100,
          maxOrderAmount: 50000,
          maxItemsPerOrder: 10,
        },
      },
      status_messages: {
        type: DataTypes.JSONB,
        defaultValue: {
          pending: { enabled: false, message: "", sendDelay: 0 },
          confirmed: { enabled: false, message: "", sendDelay: 0 },
          shipped: { enabled: false, message: "", sendDelay: 0 },
          delivered: { enabled: false, message: "", sendDelay: 0 },
          cancelled: { enabled: false, message: "", sendDelay: 0 },
        },
      },
    },
    {
      sequelize,
      modelName: "OrderSettings",
      tableName: "order_settings",
      timestamps: true,
    }
  );
  return OrderSettings;
};

