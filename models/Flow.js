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
        as: "nodes",
      });
      Flow.hasMany(models.FlowEdge, {
        foreignKey: "flow_id",
        onDelete: "CASCADE",
        as: "edges",
      });
    }
  }
  Flow.init(
    {
      uid: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
          model: 'users',
          key: 'uid'
        },
        onDelete: 'CASCADE',
        onUpdate: 'CASCADE'
      },
      flow_id: {
        type: DataTypes.STRING,
        allowNull: true
      },
      title: {
        type: DataTypes.STRING,
        allowNull: true
      },
      prevent_list: {
        type: DataTypes.TEXT,
        allowNull: true
      },
      ai_list: {
        type: DataTypes.TEXT,
        allowNull: true
      }
    }, {
      sequelize,
      modelName: "Flow",
      tableName: "flows",
    }
  );
  return Flow;
};
