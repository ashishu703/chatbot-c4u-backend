'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class contact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  contact.init({
    uid: DataTypes.STRING,
    phonebook_id: DataTypes.STRING,
    phonebook_name: DataTypes.STRING,
    name: DataTypes.STRING,
    mobile: DataTypes.STRING,
    var1: DataTypes.STRING,
    var2: DataTypes.STRING,
    var3: DataTypes.STRING,
    var4: DataTypes.STRING,
    var5: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'contact',
  });
  return contact;
};