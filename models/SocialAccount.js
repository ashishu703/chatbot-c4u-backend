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
        foreignKey: "account_id",
        as: "chats",
      });
      SocialAccount.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
    }
  }
  SocialAccount.init(
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      platform: DataTypes.STRING,
      avatar: DataTypes.TEXT,
      uid: DataTypes.STRING,
      social_user_id: DataTypes.STRING,
      social_account_id: DataTypes.TEXT,
      name: DataTypes.STRING,
      username: DataTypes.STRING,
      token: DataTypes.TEXT,
      refresh_token: DataTypes.TEXT,
      expires_in: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "SocialAccount",
      tableName: "social_accounts",
    }
  );
  return SocialAccount;
};
