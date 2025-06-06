"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chatbot extends Model {
    static associate(models) {
      Chatbot.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
    }
  }
  Chatbot.init(
    {
      uid: DataTypes.STRING,
      title: DataTypes.STRING,
      for_all: DataTypes.INTEGER,
      chats: DataTypes.TEXT,
      flow: DataTypes.TEXT,
      flow_id: DataTypes.STRING,
      active: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Chatbot",
      tableName: "chatbots",
    }
  );
  return Chatbot;
};
