"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DisabledChat extends Model {
    static associate(models) {
      DisabledChat.belongsTo(models.Chat, {
        foreignKey: "chat_id",
        as: "chat",
      });
    }
  }
  DisabledChat.init(
    {
      chat_id: DataTypes.INTEGER,
      timezone: DataTypes.STRING,
      timestamp: DataTypes.INTEGER
    },
    {
      sequelize,
      modelName: "DisabledChat",
      tableName: "disabled_chats",
      timestamps: false,
    }
  );
  return DisabledChat;
};
