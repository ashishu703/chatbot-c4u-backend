"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SmiUserTokens extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  SmiUserTokens.init(
    {
      uid: DataTypes.STRING,
      platform: DataTypes.ENUM("messenger", "instagram"),
      token: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "SmiUserTokens",
      tableName: "smi_user_tokens",
    }
  );
  return SmiUserTokens;
};
