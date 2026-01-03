"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class CommerceSettings extends Model {
    static associate(models) {
      CommerceSettings.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
        unique: true,
      });
    }
  }
  CommerceSettings.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      show_catalog: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      enable_cart: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      settings_data: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: "CommerceSettings",
      tableName: "commerce_settings",
      timestamps: true,
    }
  );
  return CommerceSettings;
};

