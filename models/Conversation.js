"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Conversation extends Model {
    static associate(models) {
      Conversation.belongsTo(models.Chat, {
        foreignKey: "chat_id",
        targetKey: "chat_id",
        as: "chat",
      });
    }
  }
  Conversation.init(
    {
      uid: DataTypes.STRING,
      chat_id: DataTypes.INTEGER,
      owner_id: DataTypes.STRING,
      type: DataTypes.STRING,
      message_id: DataTypes.STRING,
      status: DataTypes.STRING,
      text: DataTypes.TEXT,
      reaction: DataTypes.STRING,
      route: DataTypes.STRING,
      timestamp: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Conversation",
      tableName: "conversations",
    }
  );
  return Conversation;
};
