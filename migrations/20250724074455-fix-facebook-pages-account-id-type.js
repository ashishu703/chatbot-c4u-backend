'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Drop foreign key constraints using exact names, ignore if not found
    try { await queryInterface.removeConstraint('facebook_pages', 'facebook_pages_account_id_fkey'); } catch (e) {}
    try { await queryInterface.removeConstraint('chats', 'chats_account_id_fkey'); } catch (e) {}
    try { await queryInterface.removeConstraint('meta_templete_medias', 'meta_templete_medias_account_id_fkey'); } catch (e) {}
    // Change id in social_accounts to STRING
    await queryInterface.changeColumn('social_accounts', 'id', {
      type: Sequelize.STRING,
      allowNull: false,
      primaryKey: true,
    });
    // Change account_id in all referencing tables to STRING
    await queryInterface.changeColumn('facebook_pages', 'account_id', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.changeColumn('chats', 'account_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    await queryInterface.changeColumn('meta_templete_medias', 'account_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });
    // Ensure all account_ids in facebook_pages exist in social_accounts
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
    // Re-add foreign key constraints using exact names
    await queryInterface.addConstraint('facebook_pages', {
      fields: ['account_id'],
      type: 'foreign key',
      name: 'facebook_pages_account_id_fkey',
      references: {
        table: 'social_accounts',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('chats', {
      fields: ['account_id'],
      type: 'foreign key',
      name: 'chats_account_id_fkey',
      references: {
        table: 'social_accounts',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('meta_templete_medias', {
      fields: ['account_id'],
      type: 'foreign key',
      name: 'meta_templete_medias_account_id_fkey',
      references: {
        table: 'social_accounts',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },

  async down (queryInterface, Sequelize) {
    try { await queryInterface.removeConstraint('facebook_pages', 'facebook_pages_account_id_fkey'); } catch (e) {}
    try { await queryInterface.removeConstraint('chats', 'chats_account_id_fkey'); } catch (e) {}
    try { await queryInterface.removeConstraint('meta_templete_medias', 'meta_templete_medias_account_id_fkey'); } catch (e) {}
    await queryInterface.changeColumn('facebook_pages', 'account_id', {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
    await queryInterface.changeColumn('chats', 'account_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('meta_templete_medias', 'account_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });
    await queryInterface.changeColumn('social_accounts', 'id', {
      type: Sequelize.INTEGER,
      allowNull: false,
      autoIncrement: true,
      primaryKey: true,
    });
    await queryInterface.addConstraint('facebook_pages', {
      fields: ['account_id'],
      type: 'foreign key',
      name: 'facebook_pages_account_id_fkey',
      references: {
        table: 'social_accounts',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('chats', {
      fields: ['account_id'],
      type: 'foreign key',
      name: 'chats_account_id_fkey',
      references: {
        table: 'social_accounts',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
    await queryInterface.addConstraint('meta_templete_medias', {
      fields: ['account_id'],
      type: 'foreign key',
      name: 'meta_templete_medias_account_id_fkey',
      references: {
        table: 'social_accounts',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  }
};
