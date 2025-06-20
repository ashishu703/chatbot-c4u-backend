"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FlowNode extends Model {
    static associate(models) {
      FlowNode.belongsTo(models.Flow, {
        foreignKey: "flow_id",
      });
    }
  }
  FlowNode.init(
    {
      node_id: DataTypes.STRING,
      flow_id: DataTypes.INTEGER,
      type: DataTypes.STRING,
      node_type: DataTypes.STRING,
      data: DataTypes.JSON,
      position: DataTypes.JSON,
      position_absolute: DataTypes.JSON,
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
