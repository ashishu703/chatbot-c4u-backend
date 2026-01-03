const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class Integration extends Model {
    static associate(models) {
      Integration.belongsTo(models.User, {
        foreignKey: "userId",
        as: "user",
      });
    }
  }

  Integration.init(
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
      type: {
        type: DataTypes.ENUM("google_sheets", "facebook_lead_ads", "indiamart"),
        allowNull: false,
        comment: "Integration type",
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        comment: "Integration name/identifier",
      },
      isConnected: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        comment: "Whether the integration is connected",
      },
      credentials: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Encrypted JSON credentials for the integration",
        get() {
          const rawValue = this.getDataValue("credentials");
          if (!rawValue) return null;
          try {
            return JSON.parse(rawValue);
          } catch {
            return rawValue;
          }
        },
        set(value) {
          this.setDataValue("credentials", JSON.stringify(value));
        },
      },
      settings: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "JSON settings/configuration for the integration",
        get() {
          const rawValue = this.getDataValue("settings");
          if (!rawValue) return null;
          try {
            return JSON.parse(rawValue);
          } catch {
            return rawValue;
          }
        },
        set(value) {
          this.setDataValue("settings", JSON.stringify(value));
        },
      },
      webhookUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Webhook URL for receiving data",
      },
      webhookSecret: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: "Webhook secret for verification",
      },
      lastSyncAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: "Last successful sync timestamp",
      },
      errorMessage: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: "Last error message if any",
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
      modelName: "Integration",
      tableName: "integrations",
      timestamps: true,
      indexes: [
        {
          fields: ["userId"],
        },
        {
          fields: ["type"],
        },
        {
          unique: true,
          fields: ["userId", "type"],
          name: "unique_user_integration_type",
        },
      ],
    }
  );

  return Integration;
};

