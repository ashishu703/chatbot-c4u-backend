"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class MetaApi extends Model {
    static associate(models) {
      // define associations if any
    }
  }
  MetaApi.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      waba_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      business_account_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      access_token: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      business_phone_number_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      app_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "MetaApi",
      tableName: "meta_apis",
      timestamps: true,
    }
  );
  return MetaApi;
};
