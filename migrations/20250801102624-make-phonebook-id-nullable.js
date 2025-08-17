'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
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
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.changeColumn('contacts', 'phonebook_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: "phonebooks",
        key: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  }
}; 