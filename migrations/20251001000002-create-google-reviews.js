"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("google_reviews", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      reviewId: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      reviewerName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      reviewerPhotoUrl: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      rating: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      comment: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      replyText: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      replyStatus: {
        type: Sequelize.ENUM("pending", "replied", "failed"),
        defaultValue: "pending",
      },
      reviewStatus: {
        type: Sequelize.ENUM("new", "in_review", "resolved", "hidden"),
        defaultValue: "new",
      },
      isPositive: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      source: {
        type: Sequelize.STRING,
        defaultValue: "google",
      },
      reviewTime: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("google_reviews");
  },
};

