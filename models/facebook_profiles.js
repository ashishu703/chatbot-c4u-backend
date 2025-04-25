'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class facebook_profiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  facebook_profiles.init({
    uid: DataTypes.STRING,
    account_id: DataTypes.STRING,
    name: DataTypes.STRING,
    token: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'facebook_profiles',
  });
  return facebook_profiles;
};