"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("meta_apis", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      uid: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      waba_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      business_account_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      access_token: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      business_phone_number_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      app_id: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      pin: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("meta_apis");
  },
};
