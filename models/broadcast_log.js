'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class broadcast_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  broadcast_log.init({
    uid: DataTypes.STRING,
    broadcast_id: DataTypes.STRING,
    templet_name: DataTypes.STRING,
    is_read: DataTypes.INTEGER,
    meta_msg_id: DataTypes.STRING,
    sender_mobile: DataTypes.STRING,
    send_to: DataTypes.STRING,
    delivery_status: DataTypes.STRING,
    delivery_time: DataTypes.STRING,
    err: DataTypes.TEXT,
    example: DataTypes.TEXT,
    contact: DataTypes.TEXT,
  }, {
    sequelize,
    modelName: 'broadcast_log',
  });
  return broadcast_log;
};