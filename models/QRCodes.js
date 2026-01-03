"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QRCodes extends Model {
    static associate(models) {
      QRCodes.belongsTo(models.QRMaster, {
        foreignKey: "qr_master_id",
        targetKey: "qr_master_id",
        as: "qrMaster",
      });
      QRCodes.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
    }
  }

  QRCodes.init(
    {
      qr_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
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
      uid: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      purpose: {
        type: DataTypes.ENUM(
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
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      qr_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      qr_image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "used", "expired", "inactive"),
        defaultValue: "active",
      },
      scan_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "QRCodes",
      tableName: "qr_codes",
      timestamps: true,
    }
  );

  return QRCodes;
};
