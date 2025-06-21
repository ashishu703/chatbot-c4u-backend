"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    static associate(models) {}
  }
  Admin.init(
    {
      email: DataTypes.STRING,
      name: DataTypes.STRING,
      password: DataTypes.STRING,
      uid: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Admin",
      tableName: "admins",
    }
  );
  return Admin;
};
