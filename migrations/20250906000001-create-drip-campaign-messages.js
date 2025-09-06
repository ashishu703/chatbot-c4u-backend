"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("drip_campaign_messages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      message_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      campaign_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "drip_campaigns",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      flow_id: {
        type: Sequelize.INTEGER,
        allowNull: true,
        references: {
          model: "flows",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      flow_title: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      delay_value: {
        type: Sequelize.INTEGER,
        allowNull: true,
        defaultValue: 1,
      },
      time_unit: {
        type: Sequelize.ENUM('immediately', 'minutes', 'hours', 'days'),
        allowNull: true,
        defaultValue: 'hours',
      },
      status: {
        type: Sequelize.ENUM('pending', 'sent', 'failed'),
        allowNull: true,
        defaultValue: 'pending',
      },
      scheduled_at: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      sent_at: {
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
    await queryInterface.dropTable("drip_campaign_messages");
  },
};
