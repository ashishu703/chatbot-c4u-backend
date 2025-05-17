"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Agents extends Model {
    static associate(models) {
      Agents.hasMany(models.AgentTask, {
        foreignKey: "uid",
        sourceKey: "uid",
        as: "tasks",
      });
    }
  }
  Agents.init(
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
      modelName: "Agents",
      tableName: "agents",
    }
  );
  return Agents;
};
