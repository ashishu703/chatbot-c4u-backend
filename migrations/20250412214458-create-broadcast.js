"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("broadcasts", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      broadcast_id: {
        type: Sequelize.STRING,
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
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      templet: {
        type: Sequelize.JSON,
        allowNull: true,
      },
      phonebook_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "phonebooks",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      schedule: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      timezone: {
        type: Sequelize.STRING,
        defaultValue: "Asia/Kolkata",
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
    await queryInterface.dropTable("broadcasts");
  },
};
