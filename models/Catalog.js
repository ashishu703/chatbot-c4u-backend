"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Catalog extends Model {
    static associate(models) {
      Catalog.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
      Catalog.hasMany(models.Product, {
        foreignKey: "catalog_id",
        as: "products",
      });
    }
  }
  Catalog.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      catalog_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: false, // Remove unique constraint as it should be unique per user, not globally
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      platform: {
        type: DataTypes.STRING,
        defaultValue: "whatsapp",
      },
      status: {
        type: DataTypes.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      meta_data: {
        type: DataTypes.JSONB,
        defaultValue: {},
      },
    },
    {
      sequelize,
      modelName: "Catalog",
      tableName: "catalogs",
      timestamps: true,
    }
  );
  return Catalog;
};

