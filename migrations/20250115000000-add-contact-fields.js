'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // This migration is redundant since phonebook_id is already included in create-contacts migration
    // We can safely skip this migration
    return Promise.resolve();
  },

  async down (queryInterface, Sequelize) {
    // Remove phonebook_id field only
    await queryInterface.removeColumn('contacts', 'phonebook_id');
  }
};
