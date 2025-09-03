"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FacebookComment extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FacebookComment.belongsTo(models.SocialAccount, {
        foreignKey: "social_account_id",
        targetKey: "id",
        as: "socialAccount",
      });
      FacebookComment.belongsTo(models.FacebookPage, {
        foreignKey: "page_id",
        targetKey: "id",
        as: "facebookPage",
      });
    }
  }
  FacebookComment.init(
    {
      comment_id: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      post_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      page_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "facebook_pages",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      user_id: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      user_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      created_time: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      social_account_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "social_accounts",
          key: "id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      status: {
        type: DataTypes.ENUM("active", "hidden", "deleted"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      sequelize,
      modelName: "FacebookComment",
      tableName: "facebook_comments",
      indexes: [
        {
          unique: true,
          fields: ["comment_id"],
        },
        {
          fields: ["post_id"],
        },
        {
          fields: ["page_id"],
        },
        {
          fields: ["user_id"],
        },
        {
          fields: ["social_account_id"],
        },
      ],
    }
  );
  return FacebookComment;
};
