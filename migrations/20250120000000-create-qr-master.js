"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("qr_master", {
      qr_master_id: {
        type: Sequelize.STRING,
        primaryKey: true,
        allowNull: false,
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
          "digital_menu_catalogue",
          "event_attendance_access",
          "payments_invoice",
          "lead_capture_crm",
          "marketing_campaign"
        ),
        allowNull: false,
      },
      qr_type: {
        type: Sequelize.ENUM("single", "unique"),
        allowNull: false,
      },
      qr_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      qr_image_url: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      metadata: {
        type: Sequelize.JSONB,
        allowNull: true,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive", "expired"),
        defaultValue: "active",
      },
      total_scans: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      expiry_date: {
        type: Sequelize.DATE,
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

    // Add index for faster queries
    await queryInterface.addIndex("qr_master", ["uid"]);
    await queryInterface.addIndex("qr_master", ["purpose"]);
    await queryInterface.addIndex("qr_master", ["status"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("qr_master");
  },
};
