"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class DripCampaign extends Model {
    static associate(models) {
      DripCampaign.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
      DripCampaign.hasMany(models.DripCampaignMessage, {
        foreignKey: "campaign_id",
        as: "messages",
      });
    }
  }
  DripCampaign.init(
    {
      campaign_id: DataTypes.STRING,
      uid: DataTypes.STRING,
      title: DataTypes.STRING,
      status: DataTypes.ENUM('active', 'paused', 'completed', 'cancelled'),
      timezone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "DripCampaign",
      tableName: "drip_campaigns",
    }
  );
  return DripCampaign;
};
