
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
      Agent.hasOne(models.User, {
        foreignKey: "uid",
        sourceKey: "owner_uid",
        as: "owner",
      })
    }
  }
  Agent.init(
    {
      owner_uid: DataTypes.STRING,
      uid: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      name: DataTypes.STRING,
      mobile: DataTypes.STRING,
      comments: DataTypes.TEXT,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "Agent",
      tableName: "agents",
    }
  );
  return Agent;
};
