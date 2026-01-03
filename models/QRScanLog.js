"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QRScanLog extends Model {
    static associate(models) {
      QRScanLog.belongsTo(models.QRCodes, {
        foreignKey: "qr_id",
        targetKey: "qr_id",
        as: "qrCode",
      });
      QRScanLog.belongsTo(models.QRMaster, {
        foreignKey: "qr_master_id",
        targetKey: "qr_master_id",
        as: "qrMaster",
      });
    }
  }

  QRScanLog.init(
    {
      scan_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      qr_id: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: "qr_codes",
          key: "qr_id",
        },
        onDelete: "SET NULL",
        onUpdate: "CASCADE",
      },
      qr_master_id: {
        type: DataTypes.STRING,
        allowNull: false,
        references: {
          model: "qr_master",
          key: "qr_master_id",
        },
        onDelete: "CASCADE",
        onUpdate: "CASCADE",
      },
      unique_token: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      ip_address: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      user_agent: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      device_type: {
        type: DataTypes.ENUM("mobile", "tablet", "desktop", "unknown"),
        defaultValue: "unknown",
      },
      browser: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      os: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      country: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      city: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      latitude: {
        type: DataTypes.DECIMAL(10, 8),
        allowNull: true,
      },
      longitude: {
        type: DataTypes.DECIMAL(11, 8),
        allowNull: true,
      },
      scan_data: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "QRScanLog",
      tableName: "qr_scan_logs",
      timestamps: true,
    }
  );

  return QRScanLog;
};
