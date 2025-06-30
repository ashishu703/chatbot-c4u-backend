"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("plans", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      short_description: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      allow_tag: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      allow_note: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      allow_chatbot: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      contact_limit: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      allow_api: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      is_trial: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      price: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      price_strike: {
        type: Sequelize.INTEGER,
        allowNull: true,
      },
      plan_duration_in_days: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("plans");
  },
};
