'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class meta_api extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  meta_api.init({
    uid: DataTypes.STRING,
    waba_id: DataTypes.STRING,
    business_account_id: DataTypes.STRING,
    access_token: DataTypes.STRING,
    business_phone_number_id: DataTypes.STRING,
    app_id: DataTypes.STRING,
    pin: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'meta_api',
  });
  return meta_api;
};