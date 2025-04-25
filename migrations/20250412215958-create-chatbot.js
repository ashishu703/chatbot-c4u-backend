'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('chatbots', {
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
      title: {
        type: Sequelize.STRING,
        allowNull:true
      },
      for_all: {
        type: Sequelize.INTEGER,
        defaultValue:"0"
      },
      chats: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      flow: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      flow_id: {
        type: Sequelize.STRING,
        allowNull:true
      },
      active: {
        type: Sequelize.INTEGER,
        defaultValue:"0"
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
    await queryInterface.dropTable('chatbots');
  }
};