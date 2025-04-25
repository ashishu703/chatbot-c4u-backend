'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class gen_links extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  gen_links.init({
    wa_mobile: DataTypes.STRING,
    email: DataTypes.STRING,
    msg: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'gen_links',
  });
  return gen_links;
};