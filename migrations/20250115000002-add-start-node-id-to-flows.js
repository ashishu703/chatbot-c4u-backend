"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // This migration is redundant since it runs before create-flows
    // The start_node_id field should be added to the create-flows migration if needed
    return Promise.resolve();
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("flows", "start_node_id");
  },
};
