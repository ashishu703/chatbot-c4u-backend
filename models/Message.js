"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Message extends Model {
    static associate(models) {
      Message.belongsTo(models.Chat, {
        foreignKey: "id",
        targetKey: "chat_id",
        as: "chat",
      });
    }
  }
  Message.init(
    {
      uid: DataTypes.STRING,
      chat_id: DataTypes.INTEGER,
      type: DataTypes.STRING,
      message_id: DataTypes.TEXT,
      status: DataTypes.STRING,
      body: DataTypes.JSON,
      route: DataTypes.STRING,
      timestamp: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Message",
      tableName: "messages",
    }
  );
  return Message;
};
