'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class plan extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  plan.init({
    title: DataTypes.STRING,
    short_description: DataTypes.TEXT,
    allow_tag: DataTypes.INTEGER,
    allow_note: DataTypes.INTEGER,
    allow_chatbot: DataTypes.INTEGER,
    contact_limit: DataTypes.STRING,
    allow_api: DataTypes.INTEGER,
    is_trial: DataTypes.INTEGER,
    price: DataTypes.BIGINT,
    price_strike: DataTypes.STRING,
    plan_duration_in_days: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'plan',
  });
  return plan;
};