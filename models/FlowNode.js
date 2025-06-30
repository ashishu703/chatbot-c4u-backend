"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FlowNode extends Model {
    static associate(models) {
      FlowNode.belongsTo(models.Flow, {
        foreignKey: "flow_id",
        as: "flow",
      });
    }
  }
  FlowNode.init(
    {
      node_id: DataTypes.STRING,
      flow_id: DataTypes.INTEGER,
      node_type: DataTypes.STRING,
      data: DataTypes.JSON,
      position: DataTypes.JSON,
      uid: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "FlowNode",
      tableName: "flow_nodes",
    }
  );
  return FlowNode;
};
