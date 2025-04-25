'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('web_privates', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      pay_offline_id: {
        type: Sequelize.STRING,
        allowNull:true
      },
      pay_offline_key: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      offline_active: {
        type: Sequelize.INTEGER,
        defaultValue:"0"
      },
      pay_stripe_id: {
        type: Sequelize.STRING,
        allowNull:true
      },
      pay_stripe_key: {
        type: Sequelize.STRING,
        allowNull:true
      },
      stripe_active: {
        type: Sequelize.INTEGER,
        defaultValue:"0"
      },
      pay_paypal_id: {
        type: Sequelize.STRING,
        allowNull:true
      },
      pay_paypal_key: {
        type: Sequelize.STRING,
        allowNull:true
      },
      paypal_active: {
        type: Sequelize.STRING,
        allowNull:true
      },
      rz_id: {
        type: Sequelize.STRING,
        allowNull:true
      },
      rz_key: {
        type: Sequelize.STRING,
        allowNull:true
      },
      rz_active: {
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
    await queryInterface.dropTable('web_privates');
  }
};