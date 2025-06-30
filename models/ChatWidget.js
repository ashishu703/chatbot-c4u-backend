"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class ChatWidget extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  ChatWidget.init(
    { 
      unique_id: DataTypes.STRING,
      uid: DataTypes.STRING,
      title: DataTypes.STRING,
      whatsapp_number: DataTypes.STRING,
      logo: DataTypes.STRING,
      place: DataTypes.STRING,
      size: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "ChatWidget",
      tableName: "chat_widgets",
    }
  );
  return ChatWidget;
};
