"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    static associate(models) {

      Chat.belongsTo(models.SocialAccount, {
        foreignKey: "account_id",
        as: "account",
      });
      
      Chat.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
      Chat.hasMany(models.Conversation, {
        foreignKey: "chat_id",
        as: "conversations",
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
      is_opened: DataTypes.BOOLEAN,
      last_message: DataTypes.TEXT,
      is_deleted: DataTypes.BOOLEAN,
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
