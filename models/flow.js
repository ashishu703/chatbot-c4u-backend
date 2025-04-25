'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class flow extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  flow.init({
    uid: DataTypes.STRING,
    flow_id: DataTypes.STRING,
    title: DataTypes.STRING,
    prevent_list: DataTypes.TEXT,
    ai_list: DataTypes.TEXT,
   
  }, {
    sequelize,
    modelName: 'flow',
  });
  return flow;
};