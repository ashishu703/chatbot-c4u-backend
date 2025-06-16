"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class WhatsappTempleteMedia extends Model {
    static associate(models) {
      // define associations if any
    }
  }
  WhatsappTempleteMedia.init(
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
      modelName: "WhatsappTempleteMedia",
      tableName: "meta_templete_medias",
      timestamps: true,
    }
  );
  return WhatsappTempleteMedia;
};
