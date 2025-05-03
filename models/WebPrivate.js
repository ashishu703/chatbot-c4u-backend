'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class WebPrivate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  WebPrivate.init({
    pay_offline_id: DataTypes.STRING,
    pay_offline_key: DataTypes.TEXT,
    offline_active: DataTypes.INTEGER,
    pay_stripe_id: DataTypes.STRING,
    pay_stripe_key: DataTypes.STRING,
    stripe_active: DataTypes.INTEGER,
    pay_paypal_id: DataTypes.STRING,
    dupay_paypal_keymmy: DataTypes.STRING,
    paypal_active: DataTypes.STRING,
    rz_id: DataTypes.STRING,
    rz_key: DataTypes.STRING,
    rz_active: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'WebPrivate',
    tableName:'web_privates'
  });
  return WebPrivate;
};