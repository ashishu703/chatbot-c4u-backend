"use strict";

const { OPEN } = require('../types/chat-status.types');

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("chats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },

      type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      chat_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      avatar: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: true,
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
      page_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "facebook_pages",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },

      chat_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      chat_tags: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      sender_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sender_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      chat_status: {
        type: Sequelize.STRING,
        defaultValue: OPEN,
      },
      last_message_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      is_deleted: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("chats");
  },
};
