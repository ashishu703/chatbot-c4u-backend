'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chats extends Model {
    static associate(models) {
      // Define association here
    }
  }
  chats.init({
    chat_id: DataTypes.STRING,
    uid: DataTypes.STRING,
    type: {
      type: DataTypes.ENUM('WHATSAPP', 'MESSENGER', 'INSTAGRAM'),
      allowNull: false,
      defaultValue: 'WHATSAPP',
      validate: {
        isIn: [['WHATSAPP', 'MESSENGER', 'INSTAGRAM']]
      }
    },
    last_message_came: DataTypes.STRING,
    chat_note: DataTypes.TEXT,
    chat_tags: DataTypes.TEXT,
    sender_name: DataTypes.STRING,
    sender_mobile: DataTypes.STRING,
    chat_status: DataTypes.STRING,
    is_opened: DataTypes.INTEGER,
    last_message: DataTypes.TEXT,
    is_deleted: DataTypes.INTEGER,
    recipient: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'chats',
    tableName: 'chats' 
  });
  return chats;
};