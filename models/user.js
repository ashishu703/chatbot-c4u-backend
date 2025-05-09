'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Orders, { foreignKey: 'uid', sourceKey: 'uid' });
    }
  }

  User.init({
    role: DataTypes.STRING,
    uid: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    mobile_with_country_code: DataTypes.STRING,
    timezone: DataTypes.STRING,
    plan: DataTypes.TEXT,
    plan_expire: DataTypes.STRING,
    trial: DataTypes.INTEGER,
    api_key: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
  });

  return User;
};
