'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Broadcast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Broadcast.init({
    broadcast_id: DataTypes.STRING,
    uid: DataTypes.STRING,
    title: DataTypes.STRING,
    templet: DataTypes.TEXT,
    phonebook: DataTypes.TEXT,
    status: DataTypes.STRING,
    schedule: DataTypes.DATE,
    timezone: DataTypes.STRING
  }, {
    sequelize,
    modelName: 'Broadcast',
     tableName:'broadcasts'
  });
  return Broadcast;
};