"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class QRMaster extends Model {
    static associate(models) {
      QRMaster.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
      QRMaster.hasMany(models.QRCodes, {
        foreignKey: "qr_master_id",
        as: "qrCodes",
      });
    }
  }

  QRMaster.init(
    {
      qr_master_id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
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
          "digital_menu_catalogue",
          "event_attendance_access",
          "payments_invoice",
          "lead_capture_crm",
          "marketing_campaign"
        ),
        allowNull: false,
      },
      qr_type: {
        type: DataTypes.ENUM("single", "unique"),
        allowNull: false,
      },
      qr_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      qr_image_url: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      metadata: {
        type: DataTypes.JSONB,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("active", "inactive", "expired"),
        defaultValue: "active",
      },
      total_scans: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
      },
      expiry_date: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      sequelize,
      modelName: "QRMaster",
      tableName: "qr_master",
      timestamps: true,
    }
  );

  return QRMaster;
};
