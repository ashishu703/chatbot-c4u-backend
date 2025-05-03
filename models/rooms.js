'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Rooms extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Rooms.init({
    uid: DataTypes.STRING,
    socket_id: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Rooms',
    tableName:'rooms'
  });
  return Rooms;
};