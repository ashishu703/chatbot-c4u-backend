'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class agent extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  agent.init({
    owner_uid: DataTypes.STRING,
    uid: DataTypes.STRING,
    role: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    name: DataTypes.STRING,
    mobile: DataTypes.STRING,
    comments: DataTypes.TEXT,
    is_active: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'agents',
  });
  return agent;
};