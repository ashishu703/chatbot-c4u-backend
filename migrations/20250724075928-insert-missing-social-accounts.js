'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Insert missing social_accounts for all account_ids in facebook_pages
    const [results] = await queryInterface.sequelize.query(`
      SELECT DISTINCT account_id FROM facebook_pages WHERE account_id IS NOT NULL AND account_id NOT IN (SELECT id FROM social_accounts)
    `);
    for (const row of results) {
      await queryInterface.bulkInsert('social_accounts', [{
        id: row.account_id,
        platform: 'facebook',
        avatar: null,
        uid: 'dummy-uid',
        name: 'AutoInserted',
        username: null,
        token: 'dummy',
        refresh_token: 'dummy',
        expires_in: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);
    }
  },

  async down (queryInterface, Sequelize) {
    /**
     * Add reverting commands here.
     *
     * Example:
     * await queryInterface.dropTable('users');
     */
  }
};
