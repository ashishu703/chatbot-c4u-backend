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
      Chatbot.hasMany(models.ChatbotChat, {
        foreignKey: "chatbot_id",
        as: "chatbotChats",
      });
      Chatbot.belongsTo(models.Flow, {
        foreignKey: "flow_id",
        as: "flow",
      });
    }
  }
  Chatbot.init(
    {
      uid: DataTypes.STRING,
      title: DataTypes.STRING,
      for_all: DataTypes.INTEGER,
      flow_id: DataTypes.INTEGER,
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
