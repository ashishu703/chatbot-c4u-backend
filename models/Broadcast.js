"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Broadcast extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Broadcast.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "broadcast",
      });
      Broadcast.belongsTo(models.Phonebook, {
        foreignKey: "phonebook_id",
        as: "phonebook",
      });
    }
  }
  Broadcast.init(
    {
      broadcast_id: DataTypes.STRING,
      uid: DataTypes.STRING,
      title: DataTypes.STRING,
      templet: DataTypes.TEXT,
      phonebook_id: DataTypes.INTEGER,
      status: DataTypes.STRING,
      schedule: DataTypes.DATE,
      timezone: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Broadcast",
      tableName: "broadcasts",
    }
  );
  return Broadcast;
};
