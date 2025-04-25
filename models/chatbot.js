'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class chatbot extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  chatbot.init({
    uid: DataTypes.STRING,
    title: DataTypes.STRING,
    for_all: DataTypes.INTEGER,
    chats: DataTypes.TEXT,
    flow: DataTypes.TEXT,
    flow_id: DataTypes.STRING,
    active: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'chatbot',
  });
  return chatbot;
};