'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Remove the foreign key constraint
    await queryInterface.removeConstraint('contacts', 'contacts_phonebook_id_fkey');
    
    // Change the column to be a simple integer without foreign key
    await queryInterface.changeColumn('contacts', 'phonebook_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },

  async down (queryInterface, Sequelize) {
    // Add back the foreign key constraint
    await queryInterface.changeColumn('contacts', 'phonebook_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "phonebooks",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}; 