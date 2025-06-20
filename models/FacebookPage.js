"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class FacebookPage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      FacebookPage.belongsTo(models.SocialAccount, {
        foreignKey: "account_id",
        targetKey: "id",
        as: "account",
      });
      FacebookPage.belongsTo(models.Chat, {
        foreignKey: "id",
        targetKey: "page_id",
        as: "chat",
      });
    }
  }
  FacebookPage.init(
    {
      uid: DataTypes.STRING,
      name: DataTypes.STRING,
      page_id: DataTypes.STRING,
      account_id: DataTypes.INTEGER,
      token: DataTypes.TEXT,
      avatar: DataTypes.TEXT,
      is_active: DataTypes.BOOLEAN,
    },
    {
      sequelize,
      modelName: "FacebookPage",
      tableName: "facebook_pages",
    }
  );
  return FacebookPage;
};
