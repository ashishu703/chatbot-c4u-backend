"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("order_settings", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
        references: {
          model: "users",
          key: "uid",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      payment_methods: {
        type: Sequelize.JSONB,
        defaultValue: {
          cod: { enabled: false, minAmount: 0, maxAmount: "No limit" },
          razorpay: { enabled: false },
          upi: { enabled: false },
        },
      },
      shipping: {
        type: Sequelize.JSONB,
        defaultValue: {
          standard: { enabled: false, deliveryTime: "3-5 business days", charges: 50 },
        },
      },
      checkout: {
        type: Sequelize.JSONB,
        defaultValue: {
          addressCollection: {
            enabled: false,
            method: "Interactive (Buttons/Quick Replies)",
            requiredFields: {},
            optionalFields: {},
          },
          autoConfirm: false,
          minOrderAmount: 100,
          maxOrderAmount: 50000,
          maxItemsPerOrder: 10,
        },
      },
      status_messages: {
        type: Sequelize.JSONB,
        defaultValue: {
          pending: { enabled: false, message: "", sendDelay: 0 },
          confirmed: { enabled: false, message: "", sendDelay: 0 },
          shipped: { enabled: false, message: "", sendDelay: 0 },
          delivered: { enabled: false, message: "", sendDelay: 0 },
          cancelled: { enabled: false, message: "", sendDelay: 0 },
        },
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
    await queryInterface.dropTable("order_settings");
  },
};

