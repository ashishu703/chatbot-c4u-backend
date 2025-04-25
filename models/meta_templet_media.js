'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class meta_templet_media extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  meta_templet_media.init({
    uid: DataTypes.STRING,
    templet_name: DataTypes.STRING,
    meta_hash: DataTypes.STRING,
    file_name: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'meta_templet_media',
  });
  return meta_templet_media;
};