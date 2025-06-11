"use strict";

const { INCOMING } = require('../types/conversation-route.types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("messages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: false,
      },

      chat_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "chats",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      owner_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      attchment_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      message_id: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      reaction: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      route: {
        type: Sequelize.STRING,
        defaultValue: INCOMING,
        allowNull: false,
      },
      timestamp: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("messages");
  },
};
