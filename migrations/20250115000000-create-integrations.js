"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("integrations", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      userId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      type: {
        type: Sequelize.ENUM("google_sheets", "facebook_lead_ads", "indiamart"),
        allowNull: false,
        comment: "Integration type",
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
        comment: "Integration name/identifier",
      },
      isConnected: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether the integration is connected",
      },
      credentials: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Encrypted JSON credentials for the integration",
      },
      settings: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "JSON settings/configuration for the integration",
      },
      webhookUrl: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Webhook URL for receiving data",
      },
      webhookSecret: {
        type: Sequelize.STRING,
        allowNull: true,
        comment: "Webhook secret for verification",
      },
      lastSyncAt: {
        type: Sequelize.DATE,
        allowNull: true,
        comment: "Last successful sync timestamp",
      },
      errorMessage: {
        type: Sequelize.TEXT,
        allowNull: true,
        comment: "Last error message if any",
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

    // Add indexes
    await queryInterface.addIndex("integrations", ["userId"]);
    await queryInterface.addIndex("integrations", ["type"]);
    await queryInterface.addIndex("integrations", ["userId", "type"], {
      unique: true,
      name: "unique_user_integration_type",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("integrations");
  },
};

