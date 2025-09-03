"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("facebook_posts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      post_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
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
      message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      story: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      created_time: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updated_time: {
        type: Sequelize.DATE,
        allowNull: true,
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
    await queryInterface.dropTable("facebook_posts");
  },
};
