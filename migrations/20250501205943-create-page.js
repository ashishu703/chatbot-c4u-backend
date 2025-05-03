'use strict';
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('pages', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      slug: {
        type: Sequelize.STRING,
        allowNull:true
      },
      title: {
        type: Sequelize.STRING,
        allowNull:true
      },
      image: {
        type: Sequelize.STRING,
        allowNull:true
      },
      content: {
        type: Sequelize.TEXT,
        allowNull:true
      },
      permanent: {
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
    await queryInterface.dropTable('pages');
  }
};