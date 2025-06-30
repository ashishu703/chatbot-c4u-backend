"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ChatbotChat extends Model {
    static associate(models) {
      ChatbotChat.belongsTo(models.Chat, {
        foreignKey: "chat_id",
        as: "chat",
      });
      ChatbotChat.belongsTo(models.Chatbot, {
        foreignKey: "chatbot_id",
        as: "chatbot",
      });

    }
  }
  ChatbotChat.init(
    {
      chat_id: DataTypes.INTEGER,
      chatbot_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "ChatbotChat",
      tableName: "chatbot_chats",
    }
  );
  return ChatbotChat;
};
