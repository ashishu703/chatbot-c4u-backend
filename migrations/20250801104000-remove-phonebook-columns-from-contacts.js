'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('contacts', 'phonebook_id');
    await queryInterface.removeColumn('contacts', 'phonebook_name');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('contacts', 'phonebook_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.addColumn('contacts', 'phonebook_name', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
