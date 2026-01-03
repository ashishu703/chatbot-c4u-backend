"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class PaymentConfiguration extends Model {
    static associate(models) {
      PaymentConfiguration.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
    }
  }
  PaymentConfiguration.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      provider: {
        type: DataTypes.STRING,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      payment_gateway_mid: {
        type: DataTypes.STRING,
      },
      mcc: {
        type: DataTypes.STRING,
      },
      mcc_description: {
        type: DataTypes.STRING,
      },
      purpose_code: {
        type: DataTypes.STRING,
      },
      purpose_code_description: {
        type: DataTypes.STRING,
      },
      upi_vpa: {
        type: DataTypes.STRING,
      },
      config_data: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: "PaymentConfiguration",
      tableName: "payment_configurations",
      timestamps: true,
    }
  );
  return PaymentConfiguration;
};

