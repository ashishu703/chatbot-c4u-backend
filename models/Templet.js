"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Templet extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Templet.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
    }
  }
  Templet.init(
    {
      uid: DataTypes.STRING,
      content: DataTypes.TEXT,
      type: DataTypes.STRING,
      title: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Templet",
      tableName: "templets",
    }
  );
  return Templet;
};
