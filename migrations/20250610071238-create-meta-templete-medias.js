"use strict";

const { INCOMING } = require('../types/conversation-route.types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meta_templete_medias", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "uid",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      account_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "social_accounts",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      template_name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      meta_hash: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      file_name: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      message_id: {
        type: Sequelize.TEXT,
        allowNull: false,
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
    await queryInterface.dropTable("meta_templete_medias");
  },
};
