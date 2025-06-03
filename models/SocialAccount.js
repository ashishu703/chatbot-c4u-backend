"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class SocialAccount extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      SocialAccount.hasMany(models.Chat, {
        foreignKey: "chat_id",
        targetKey: "chat_id",
        as: "chat",
      });
    }
  }
  SocialAccount.init(
    {
      uid: DataTypes.STRING,
      account_id: DataTypes.STRING,
      name: DataTypes.STRING,
      token: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "SocialAccount",
      tableName: "facebook_profiles",
    }
  );
  return SocialAccount;
};
