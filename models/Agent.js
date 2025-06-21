"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Agent extends Model {
    static associate(models) {
      Agent.hasMany(models.AgentTask, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "tasks",
      });
    }
  }
  Agent.init(
    {
      owner_uid: DataTypes.STRING,
      uid: DataTypes.STRING,
      role: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      mobile: DataTypes.STRING,
      comments: DataTypes.TEXT,
      is_active: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Agent",
      tableName: "agents",
    }
  );
  return Agent;
};
