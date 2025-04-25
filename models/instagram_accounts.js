'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class instagram_accounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  instagram_accounts.init({
    uid: DataTypes.STRING,
    instagram_user_id: DataTypes.STRING,
    account_id: DataTypes.STRING,
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    avatar: DataTypes.STRING,
    token: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'instagram_accounts',
  });
  return instagram_accounts;
};