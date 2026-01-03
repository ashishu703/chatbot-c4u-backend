"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Product extends Model {
    static associate(models) {
      Product.belongsTo(models.Catalog, {
        foreignKey: "catalog_id",
        as: "catalog",
      });
      Product.hasMany(models.OrderItem, {
        foreignKey: "product_id",
        as: "orderItems",
      });
    }
  }
  Product.init(
    {
      catalog_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "catalogs",
          key: "id",
        },
      },
      product_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.TEXT,
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
      },
      currency: {
        type: DataTypes.STRING,
        defaultValue: "INR",
      },
      image_url: {
        type: DataTypes.TEXT,
      },
      retailer_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      availability: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "in stock",
      },
      condition: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: "new",
      },
      brand: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      category: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      inventory: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: 0,
      },
      url: {
        type: DataTypes.TEXT,
        allowNull: true,
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
      modelName: "Product",
      tableName: "products",
      timestamps: true,
    }
  );
  return Product;
};

