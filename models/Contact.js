"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Contact extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      Contact.belongsTo(models.User, {
        foreignKey: "uid",
        targetKey: "uid",
        as: "user",
      });
      Contact.belongsTo(models.Phonebook, {
        foreignKey: "phonebook_id",
        targetKey: "id",
        as: "phonebook",
      });
    }
  }
  Contact.init(
    {
      uid: DataTypes.STRING,
      name: DataTypes.STRING,
      mobile: DataTypes.STRING,
      phonebook_id: DataTypes.INTEGER,
      source: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Contact",
      tableName: "contacts",
    }
  );
  return Contact;
};
