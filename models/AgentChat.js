'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class AgentChat extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  AgentChat.init({
    owner_uid: DataTypes.STRING,
    uid: DataTypes.STRING,
    chat_id: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'AgentChat',
    tableName:'agent_chats'
  });
  return AgentChat;
};