"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DripCampaignMessage extends Model {
    static associate(models) {
      DripCampaignMessage.belongsTo(models.DripCampaign, {
        foreignKey: "campaign_id",
        as: "campaign",
      });
      DripCampaignMessage.belongsTo(models.Flow, {
        foreignKey: "flow_id",
        as: "flow",
      });
    }
  }
  DripCampaignMessage.init(
    {
      message_id: DataTypes.STRING,
      campaign_id: DataTypes.INTEGER,
      flow_id: DataTypes.INTEGER,
      flow_title: DataTypes.STRING,
      delay_value: DataTypes.INTEGER,
      time_unit: DataTypes.ENUM('immediately', 'minutes', 'hours', 'days'),
      status: DataTypes.ENUM('pending', 'sent', 'failed'),
      scheduled_at: DataTypes.DATE,
      sent_at: DataTypes.DATE,
      time_interval_enabled: DataTypes.BOOLEAN,
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,
      selected_days: DataTypes.JSON,
    },
    {
      sequelize,
      modelName: "DripCampaignMessage",
      tableName: "drip_campaign_messages",
    }
  );
  return DripCampaignMessage;
};
