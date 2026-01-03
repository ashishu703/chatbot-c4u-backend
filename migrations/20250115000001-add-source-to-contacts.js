'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // This migration is redundant since it runs before create-contacts
    // The source field should be added to the create-contacts migration if needed
    return Promise.resolve();
  },

  async down (queryInterface, Sequelize) {
    // Remove source field from contacts table
    await queryInterface.removeColumn('contacts', 'source');
  }
};
