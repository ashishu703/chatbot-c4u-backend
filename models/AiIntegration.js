const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class AiIntegration extends Model {
    static associate(models) {
      AiIntegration.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  AiIntegration.init(
    {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: DataTypes.INTEGER,
      },
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id",
        },
        onUpdate: "CASCADE",
        onDelete: "CASCADE",
      },
      provider: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "openai",
        comment: "AI provider (openai, anthropic, etc.)",
      },
      apiKey: {
        type: DataTypes.TEXT,
        allowNull: false,
        comment: "Encrypted API key for the AI service",
      },
      model: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: "gpt-4o-mini",
        comment: "AI model to use (gpt-4o-mini, gpt-4o, gpt-3.5-turbo, etc.)",
      },
      temperature: {
        type: DataTypes.FLOAT,
        allowNull: false,
        defaultValue: 0.7,
        comment: "Temperature setting for AI responses (0-1)",
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        comment: "Whether this AI integration is active",
      },
      createdAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: DataTypes.DATE,
      },
    },
    {
      sequelize,
      modelName: "AiIntegration",
      tableName: "ai_integrations",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["provider"],
        },
        {
          fields: ["isActive"],
        },
      ],
    }
  );

  return AiIntegration;
};
