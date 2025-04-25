'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class facebook_pages extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  facebook_pages.init({
    uid: DataTypes.STRING,
    name: DataTypes.STRING,
    page_id: DataTypes.STRING,
    account_id	: DataTypes.STRING,
    token: DataTypes.TEXT,
    status: DataTypes.INTEGER,
  }, {
    sequelize,
    modelName: 'facebook_pages',
  });
  return facebook_pages;
};