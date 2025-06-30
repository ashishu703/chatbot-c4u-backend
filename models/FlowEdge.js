"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FlowEdge extends Model {
    static associate(models) {
      FlowEdge.belongsTo(models.Flow, {
        foreignKey: "flow_id",
        as: "flow",
      });
      FlowEdge.belongsTo(models.FlowNode, {
        foreignKey: "source",
        targetKey: "node_id",
        as: "sourceNode",
      });
      FlowEdge.belongsTo(models.FlowNode, {
        foreignKey: "target",
        targetKey: "node_id",
        as: "targetNode",
      });
    }
  }
  FlowEdge.init(
    {
      source: DataTypes.STRING,
      target: DataTypes.STRING,
      source_handle: DataTypes.STRING,
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
