"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("qr_scan_logs", {
      scan_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
      },
      qr_id: {
        type: Sequelize.STRING,
        allowNull: true,
        references: {
          model: "qr_codes",
          key: "qr_id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      qr_master_id: {
        type: Sequelize.STRING,
        allowNull: false,
        references: {
          model: "qr_master",
          key: "qr_master_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      unique_token: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ip_address: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      user_agent: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      device_type: {
        type: Sequelize.ENUM("mobile", "tablet", "desktop", "unknown"),
        defaultValue: "unknown",
      },
      browser: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      os: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      country: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      city: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      latitude: {
        type: Sequelize.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: Sequelize.DECIMAL(11, 8),
        allowNull: true,
      },
      scan_data: {
        type: Sequelize.JSONB,
        allowNull: true,
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

    // Add indexes
    await queryInterface.addIndex("qr_scan_logs", ["qr_id"]);
    await queryInterface.addIndex("qr_scan_logs", ["qr_master_id"]);
    await queryInterface.addIndex("qr_scan_logs", ["unique_token"]);
    await queryInterface.addIndex("qr_scan_logs", ["createdAt"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("qr_scan_logs");
  },
};
