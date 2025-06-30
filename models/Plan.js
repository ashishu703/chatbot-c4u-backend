"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Plan extends Model {
    static associate(models) {
      // define association here
    }
  }
  Plan.init(
    {
      title: DataTypes.STRING,
      short_description: DataTypes.TEXT,
      allow_tag: DataTypes.BOOLEAN,
      allow_note: DataTypes.BOOLEAN,
      allow_chatbot: DataTypes.BOOLEAN,
      contact_limit: DataTypes.INTEGER,
      allow_api: DataTypes.BOOLEAN,
      is_trial: DataTypes.BOOLEAN,
      price: DataTypes.INTEGER,
      price_strike: DataTypes.INTEGER,
      plan_duration_in_days: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Plan",
      tableName: "plans",
    }
  );
  return Plan;
};
