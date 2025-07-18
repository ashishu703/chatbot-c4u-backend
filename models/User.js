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
      plan_id: DataTypes.TEXT,
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
