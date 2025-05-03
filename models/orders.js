'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Orders extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Orders.init({
    uid: DataTypes.STRING,
    payment_mode: DataTypes.STRING,
    amount: DataTypes.STRING,
    data: DataTypes.TEXT,
    s_token: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'Orders',
    tableName:'orders'
  });
  return Orders;
};