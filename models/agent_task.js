'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class agent_task extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  agent_task.init({
    owner_uid: DataTypes.STRING,
    uid: DataTypes.STRING,
    title: DataTypes.STRING,
    description: DataTypes.TEXT,
    agent_comments: DataTypes.TEXT,
    status: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'agent_task',
  });
  return agent_task;
};