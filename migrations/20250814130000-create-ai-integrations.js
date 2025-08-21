"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("ai_integrations", {
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
      provider: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "openai",
        comment: "AI provider (openai, anthropic, etc.)",
      },
      apiKey: {
        type: Sequelize.TEXT,
        allowNull: false,
        comment: "Encrypted API key for the AI service",
      },
      model: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "gpt-4o-mini",
        comment: "AI model to use (gpt-4o-mini, gpt-4o, gpt-3.5-turbo, etc.)",
      },
      temperature: {
        type: Sequelize.FLOAT,
        allowNull: false,
        defaultValue: 0.7,
        comment: "Temperature setting for AI responses (0-1)",
      },
      isActive: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Whether this AI integration is active",
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
    await queryInterface.addIndex("ai_integrations", ["userId"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("ai_integrations");
  },
};
