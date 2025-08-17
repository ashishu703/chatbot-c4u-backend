'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.renameColumn('web_publics', 'meta_webhook_verifcation_key', 'meta_webhook_verification_key');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.renameColumn('web_publics', 'meta_webhook_verification_key', 'meta_webhook_verifcation_key');
  }
};
