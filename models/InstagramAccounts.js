"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InstagramAccounts extends Model {
    static associate(models) {
      // define associations if any
    }
  }
  InstagramAccounts.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      instagram_user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      account_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      token: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "InstagramAccounts",
      tableName: "instagram_accounts",
      timestamps: true,
    }
  );
  return InstagramAccounts;
};
