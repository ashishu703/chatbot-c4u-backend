"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Chat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Chat.belongsTo(models.SocialAccount, {
        foreignKey: 'account_id',
        as: 'account',
      });

      Chat.belongsTo(models.FacebookPage, {
        foreignKey: 'page_id',
        as: 'page',
      });

      Chat.belongsTo(models.Message, {
        foreignKey: "last_message_id",
        as: "lastMessage",
      });

      Chat.hasMany(models.Message, {
        foreignKey: "chat_id",
        as: "messages",
      });

      Chat.hasMany(models.ChatbotChat, {
        foreignKey: "chat_id",
        as: "chatbotChats",
      });
      Chat.hasOne(models.AgentChat, {
        foreignKey: "chat_id",
        as: "agentChat",
      });
    }
  }
  Chat.init(
    {
      chat_id: DataTypes.STRING,
      uid: DataTypes.STRING,
      avatar: DataTypes.TEXT,
      chat_note: DataTypes.TEXT,
      chat_tags: DataTypes.JSON,
      sender_name: DataTypes.STRING,
      sender_id: DataTypes.STRING,
      chat_status: DataTypes.STRING,
      account_id: DataTypes.INTEGER,
      page_id: DataTypes.INTEGER,
      last_message_id: DataTypes.INTEGER,
      is_deleted: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Chat",
      tableName: "chats",
    }
  );
  return Chat;
};
