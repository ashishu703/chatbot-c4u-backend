'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here if needed in the future
    }
  }

  user.init({
    role: DataTypes.STRING,
    uid: DataTypes.STRING,
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    mobile_with_country_code: DataTypes.STRING,
    timezone: DataTypes.STRING,
    plan: DataTypes.TEXT, // ✅ fixed this from planplan to plan
    plan_expire: DataTypes.STRING,
    trial: DataTypes.INTEGER,
    api_key: DataTypes.STRING,
  }, {
    sequelize,
    modelName: 'user',
    tableName: 'users', // optional, ensures proper table name mapping
    timestamps: true,   // createdAt and updatedAt
    underscored: false  // use camelCase in JS
  });

  return user;
};
