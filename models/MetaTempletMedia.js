"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MetaTempleteMedia extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  MetaTempleteMedia.init(
    {
      uid: DataTypes.STRING,
      template_name: DataTypes.STRING,
      meta_hash: DataTypes.STRING,
      file_name: DataTypes.STRING,
      account_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "MetaTempleteMedia",
      tableName: "meta_templete_medias",
    }
  );
  return MetaTempleteMedia;
};
