'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class InstagramAccounts extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  InstagramAccounts.init({
    uid: DataTypes.STRING,
    instagram_user_id: DataTypes.STRING,
    account_id: DataTypes.STRING,
    name: DataTypes.STRING,
    username: DataTypes.STRING,
    avatar: DataTypes.STRING,
    token: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'InstagramAccounts',
    tableName:'instagram_accounts'
  });
  return InstagramAccounts;
};