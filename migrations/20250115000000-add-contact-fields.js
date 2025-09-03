'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add phonebook_id field only
    await queryInterface.addColumn('contacts', 'phonebook_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'phonebooks',
        key: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove phonebook_id field only
    await queryInterface.removeColumn('contacts', 'phonebook_id');
  }
};
