'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add source field to contacts table
    await queryInterface.addColumn('contacts', 'source', {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: 'manual', // Default source is manual entry
      comment: 'Source of contact: manual, csv_import, api, etc.'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove source field from contacts table
    await queryInterface.removeColumn('contacts', 'source');
  }
};
