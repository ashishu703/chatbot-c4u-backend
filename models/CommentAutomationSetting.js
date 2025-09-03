"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class CommentAutomationSetting extends Model {
    static associate(models) {
      // Association with User
      CommentAutomationSetting.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
    }
  }

  CommentAutomationSetting.init(
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "users",
          key: "uid",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      platform: {
        type: DataTypes.ENUM("facebook", "instagram"),
        allowNull: false,
        validate: {
          isIn: [["facebook", "instagram"]],
        },
      },
      
      // Private reply settings
      private_reply_type: {
        type: DataTypes.ENUM("text", "flow", "none"),
        allowNull: false,
        defaultValue: "none",
        validate: {
          isIn: [["text", "flow", "none"]],
        },
      },
      private_reply_text: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      private_reply_flow_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // Public reply settings
      public_reply_type: {
        type: DataTypes.ENUM("text", "flow", "none"),
        allowNull: false,
        defaultValue: "none",
        validate: {
          isIn: [["text", "flow", "none"]],
        },
      },
      public_reply_texts: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Array of text messages for public replies",
      },
      public_reply_flow_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // Reply target settings
      reply_to: {
        type: DataTypes.ENUM("all", "equal", "contain"),
        allowNull: false,
        defaultValue: "all",
        validate: {
          isIn: [["all", "equal", "contain"]],
        },
      },
      equal_comments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Array of exact comment texts to match",
      },
      contain_comments: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: "Array of comment text patterns to match",
      },
      
      // Post tracking settings
      track_comments: {
        type: DataTypes.ENUM("all", "specific"),
        allowNull: false,
        defaultValue: "all",
        validate: {
          isIn: [["all", "specific"]],
        },
      },
      specific_post_id: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      
      // Status
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
      },
    },
    {
      sequelize,
      modelName: "CommentAutomationSetting",
      tableName: "comment_automation_settings",
      timestamps: true,
      indexes: [
        {
          unique: true,
          fields: ["uid", "platform"],
          name: "unique_user_platform_setting",
        },
        {
          fields: ["uid"],
        },
        {
          fields: ["platform"],
        },
        {
          fields: ["is_active"],
        },
      ],
    }
  );

  return CommentAutomationSetting;
};
