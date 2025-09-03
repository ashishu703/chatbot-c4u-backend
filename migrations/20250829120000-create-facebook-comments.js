"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("facebook_comments", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      comment_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      post_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      page_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "facebook_pages",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      user_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      user_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      created_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      social_account_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "social_accounts",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.ENUM("active", "hidden", "deleted"),
        allowNull: false,
        defaultValue: "active",
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
    await queryInterface.dropTable("facebook_comments");
  },
};
