"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {
      Chat.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
      Chat.hasMany(models.Conversation, {
        foreignKey: "chat_id",
        as: "conversations",
      });
      Chat.belongsTo(models.Conversation, {
        foreignKey: "account_id",
        targetKey: "id",
        as: "account",
      });
    }
  }
  Chat.init(
    {
      chat_id: DataTypes.STRING,
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      type: DataTypes.STRING,
      avatar: DataTypes.STRING,
      last_message_came: DataTypes.STRING,
      chat_note: DataTypes.TEXT,
      chat_tags: DataTypes.TEXT,
      sender_name: DataTypes.STRING,
      sender_mobile: DataTypes.STRING,
      chat_status: DataTypes.STRING,
      account_id: DataTypes.INTEGER,
      is_opened: DataTypes.INTEGER,
      last_message: DataTypes.TEXT,
      is_deleted: DataTypes.INTEGER,
      recipient: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Chat",
      tableName: "chats",
    }
  );
  return Chat;
};
