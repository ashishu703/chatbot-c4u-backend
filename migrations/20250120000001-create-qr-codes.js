"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("qr_codes", {
      qr_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
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
      purpose: {
        type: Sequelize.ENUM(
          "appointment_booking",
          "review_feedback",
          "product_original_check",
          "loyalty_rewards",
          "inventory_warehouse",
          "event_attendance_access",
          "payments_invoice",
          "lead_capture_crm",
          "marketing_campaign"
        ),
        allowNull: false,
      },
      unique_token: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      qr_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      qr_image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "used", "expired", "inactive"),
        defaultValue: "active",
      },
      scan_count: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      expiry_date: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      metadata: {
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

    // Add indexes for faster queries
    await queryInterface.addIndex("qr_codes", ["qr_master_id"]);
    await queryInterface.addIndex("qr_codes", ["uid"]);
    await queryInterface.addIndex("qr_codes", ["unique_token"]);
    await queryInterface.addIndex("qr_codes", ["purpose"]);
    await queryInterface.addIndex("qr_codes", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("qr_codes");
  },
};
