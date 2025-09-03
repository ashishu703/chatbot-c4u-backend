"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("comment_automation_settings", {
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
      platform: {
        type: Sequelize.ENUM("facebook", "instagram"),
        allowNull: false,
      },
      
      // Private reply settings
      private_reply_type: {
        type: Sequelize.ENUM("text", "flow", "none"),
        allowNull: false,
        defaultValue: "none",
      },
      private_reply_text: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      private_reply_flow_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      
      // Public reply settings
      public_reply_type: {
        type: Sequelize.ENUM("text", "flow", "none"),
        allowNull: false,
        defaultValue: "none",
      },
      public_reply_texts: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Array of text messages for public replies",
      },
      public_reply_flow_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      
      // Reply target settings
      reply_to: {
        type: Sequelize.ENUM("all", "equal", "contain"),
        allowNull: false,
        defaultValue: "all",
      },
      equal_comments: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Array of exact comment texts to match",
      },
      contain_comments: {
        type: Sequelize.JSON,
        allowNull: true,
        comment: "Array of comment text patterns to match",
      },
      
      // Post tracking settings
      track_comments: {
        type: Sequelize.ENUM("all", "specific"),
        allowNull: false,
        defaultValue: "all",
      },
      specific_post_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      
      // Status
      is_active: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        defaultValue: true,
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

    // Add unique constraint to ensure one setting per user per platform
    await queryInterface.addConstraint("comment_automation_settings", {
      fields: ["uid", "platform"],
      type: "unique",
      name: "unique_user_platform_setting",
    });

    // Add indexes for better performance
    await queryInterface.addIndex("comment_automation_settings", ["uid"]);
    await queryInterface.addIndex("comment_automation_settings", ["platform"]);
    await queryInterface.addIndex("comment_automation_settings", ["is_active"]);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("comment_automation_settings");
  },
};
