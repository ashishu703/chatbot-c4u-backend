'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('agents', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      owner_uid: {
        type: Sequelize.STRING,
        allowNull:true
      },
      uid: {
        type: Sequelize.STRING,
        allowNull:true
      },
      role: {
        type: Sequelize.STRING,
        defaultValue: "agent"
      },
      email: {
        type: Sequelize.STRING,
        allowNull:true
      },
      password: {
        type: Sequelize.STRING,
        allowNull:true
      },
      name: {
        type: Sequelize.STRING,
        allowNull:true
      },
      mobile: {
        type: Sequelize.STRING,
        allowNull:true
      },
      comments: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      is_active: {
        type: Sequelize.INTEGER,
        defaultValue: "1"
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
    await queryInterface.dropTable('agents');
  }
};