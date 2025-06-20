"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("agent_chats", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      owner_uid: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "users",
          key: "uid",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "agents",
          key: "uid",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
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
    await queryInterface.dropTable("agent_chats");
  },
};
