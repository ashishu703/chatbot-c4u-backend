// models/webPrivate.js
"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WebPrivate extends Model {
    static associate(models) {
      // define association here
    }
  }
  WebPrivate.init(
    {
      pay_offline_id: DataTypes.STRING,
      pay_offline_key: DataTypes.TEXT,
      offline_active: DataTypes.BOOLEAN,
      pay_stripe_id: DataTypes.STRING,
      pay_stripe_key: DataTypes.STRING,
      stripe_active: DataTypes.BOOLEAN,
      pay_paypal_id: DataTypes.STRING,
      pay_paypal_key: DataTypes.STRING,
      paypal_active: DataTypes.BOOLEAN,
      rz_id: DataTypes.STRING,
      rz_key: DataTypes.STRING,
      rz_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "WebPrivate",
      tableName: "web_privates",
    }
  );
  return WebPrivate;
};
