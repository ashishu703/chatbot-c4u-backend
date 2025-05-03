'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class MetaApi extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MetaApi.init({
    uid: DataTypes.STRING,
    waba_id: DataTypes.STRING,
    business_account_id: DataTypes.STRING,
    access_token: DataTypes.STRING,
    business_phone_number_id: DataTypes.STRING,
    app_id: DataTypes.STRING,
    pin: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'MetaApi',
    tableName:'meta_apis'
  });
  return MetaApi;
};