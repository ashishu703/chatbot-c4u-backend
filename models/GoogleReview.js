"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class GoogleReview extends Model {
    static associate(models) {
      GoogleReview.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  GoogleReview.init(
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
      reviewId: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      reviewerName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      reviewerPhotoUrl: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      rating: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      comment: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      replyText: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      replyStatus: {
        type: DataTypes.ENUM("pending", "replied", "failed"),
        defaultValue: "pending",
      },
      reviewStatus: {
        type: DataTypes.ENUM("new", "in_review", "resolved", "hidden"),
        defaultValue: "new",
      },
      isPositive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      source: {
        type: DataTypes.STRING,
        defaultValue: "google",
      },
      reviewTime: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "GoogleReview",
      tableName: "google_reviews",
      timestamps: true,
    }
  );

  return GoogleReview;
};

