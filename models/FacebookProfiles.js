"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FacebookProfiles extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  FacebookProfiles.init(
    {
      uid: DataTypes.STRING,
      account_id: DataTypes.STRING,
      name: DataTypes.STRING,
      token: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "FacebookProfiles",
      tableName: "facebook_profiles",
    }
  );
  return FacebookProfiles;
};
