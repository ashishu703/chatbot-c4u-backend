'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('broadcast_logs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      uid: {
        type: Sequelize.STRING,
        allowNull:true
      },
      broadcast_id: {
        type: Sequelize.STRING,
        allowNull:true
      },
      templet_name: {
        type: Sequelize.STRING,
        allowNull:true
      },
      is_read: {
        type: Sequelize.INTEGER,
        defaultValue:"0"
      },
      meta_msg_id: {
        type: Sequelize.STRING,
        allowNull:true
      },
      sender_mobile: {
        type: Sequelize.STRING,
        allowNull:true
      },
      send_to: {
        type: Sequelize.STRING,
        allowNull:true
      },
      delivery_status: {
        type: Sequelize.STRING,
        defaultValue:"PENDING"
      },
      delivery_time: {
        type: Sequelize.STRING,
        allowNull:true
      },
      err: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      example: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      contact: {
        type: Sequelize.STRING,
        allowNull:true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('broadcast_logs');
  }
};