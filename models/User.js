"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Order, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "orders",
      });
      User.hasMany(models.Chat, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "chats",
      });
      User.hasMany(models.Chatbot, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "chatbots",
      });
      User.hasMany(models.Contact, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "contacts",
        // Explicitly exclude any phonebook related fields
        attributes: { exclude: ['phonebook_id'] }
      });
      User.hasMany(models.Broadcast, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "broadcasts",
      });
      User.hasMany(models.Flow, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "flows",
      });
      User.hasMany(models.Templet, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "templets",
      });
      User.hasMany(models.CommentAutomationSetting, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "commentAutomationSettings",
      });
      User.hasMany(models.Catalog, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "catalogs",
      });
      User.hasMany(models.EcommerceOrder, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "ecommerceOrders",
      });
      User.hasMany(models.PaymentConfiguration, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "paymentConfigurations",
      });
      User.hasOne(models.CommerceSettings, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "commerceSettings",
      });
      User.hasOne(models.OrderSettings, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "orderSettings",
      });
      User.belongsTo(models.Plan, {
        foreignKey: "plan_id",
        as: "plan",
      });
    }
  }

  User.init(
    {
      uid: DataTypes.STRING,
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      mobile_with_country_code: DataTypes.STRING,
      timezone: DataTypes.STRING,
      plan_id: DataTypes.INTEGER,
      api_key: DataTypes.STRING,
      plan_expiration: DataTypes.DATE,
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
