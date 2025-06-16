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
    }
  }

  User.init(
    {
      role: DataTypes.STRING,
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      mobile_with_country_code: DataTypes.STRING,
      timezone: DataTypes.STRING,
      plan: DataTypes.TEXT,
      plan_expire: DataTypes.STRING,
      trial: DataTypes.INTEGER,
      api_key: DataTypes.STRING,
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
