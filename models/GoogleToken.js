"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class GoogleToken extends Model {
    static associate(models) {
      GoogleToken.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  GoogleToken.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      accessToken: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      refreshToken: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      expiryDate: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      profileId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Google Business Profile Account/Location ID",
      },
      profileName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profileEmail: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      profilePicture: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isConnected: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "GoogleToken",
      tableName: "google_tokens",
      timestamps: true,
    }
  );

  return GoogleToken;
};

