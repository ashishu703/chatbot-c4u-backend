'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class GenLinks extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  GenLinks.init({
    wa_mobile: DataTypes.STRING,
    email: DataTypes.STRING,
    msg: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'GenLinks',
    tableName:'gen_links'
  });
  return GenLinks;
};