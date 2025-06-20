"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class InstagramAccount extends Model {
    static associate(models) {
      // define associations if any
    }
  }
  InstagramAccount.init(
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
      modelName: "InstagramAccount",
      tableName: "instagram_accounts",
      timestamps: true,
    }
  );
  return InstagramAccount;
};
