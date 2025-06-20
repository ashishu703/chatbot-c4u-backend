"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Flow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
        Flow.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
      Flow.hasMany(models.FlowNode, {
        foreignKey: "flow_id",
        onDelete: "CASCADE",
        hooks: true,
      });
      Flow.hasMany(models.FlowEdge, {
        foreignKey: "flow_id",
        onDelete: "CASCADE",
        hooks: true,
      });
    }
  }
  Flow.init(
    {
      uid: DataTypes.STRING,
      flow_id: DataTypes.STRING,
      title: DataTypes.STRING,
      prevent_list: DataTypes.TEXT,
      ai_list: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "Flow",
      tableName: "flows",
    }
  );
  return Flow;
};
