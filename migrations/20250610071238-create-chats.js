"use strict";
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
      chat_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      avatar: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: true,
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
      last_message_came: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      chat_note: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      chat_tags: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      sender_name: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      sender_mobile: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      chat_status: {
        type: Sequelize.STRING,
        defaultValue: "open",
      },
      is_opened: {
        type: Sequelize.INTEGER,
        defaultValue: "0",
      },
      last_message: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      is_deleted: {
        type: Sequelize.INTEGER,
        defaultValue: "0",
      },
      recipient: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("chats");
  },
};