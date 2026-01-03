"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("payment_configurations", {
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
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      provider: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        defaultValue: "active",
      },
      payment_gateway_mid: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mcc: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      mcc_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      purpose_code: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      purpose_code_description: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      upi_vpa: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      config_data: {
        type: Sequelize.JSONB,
        defaultValue: {},
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
    await queryInterface.dropTable("payment_configurations");
  },
};

