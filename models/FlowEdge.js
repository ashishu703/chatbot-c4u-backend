"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FlowEdge extends Model {
    static associate(models) {
      FlowEdge.belongsTo(models.Flow, {
        foreignKey: "flow_id",
      });
    }
  }
  FlowEdge.init(
    {
      source_id: DataTypes.STRING,
      target_id: DataTypes.STRING,
      source_handle: DataTypes.STRING,
      target_handle: DataTypes.STRING,
      edge_id: DataTypes.STRING,
      flow_id: DataTypes.INTEGER,
      uid: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "FlowEdge",
      tableName: "flow_edges",
    }
  );
  return FlowEdge;
};
