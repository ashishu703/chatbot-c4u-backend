"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop existing FK (messages.chat_id -> chats.id) before changing type
    // Use raw SQL with IF EXISTS to be safe across environments
    await queryInterface.sequelize.query(
      'ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_chat_id_fkey";'
    );

    // Change chat_id from INTEGER to STRING in messages table
    await queryInterface.changeColumn('messages', 'chat_id', {
      type: Sequelize.STRING,
      allowNull: false,
    });

    // Note: We intentionally do not recreate a FK here because the
    // application models associate Message.chat_id to Chat.chat_id (STRING)
    // via targetKey, and Postgres requires the referenced column to be UNIQUE
    // for a FK. The chats.chat_id column is not unique currently.
  },

  async down(queryInterface, Sequelize) {
    // Revert back to INTEGER and restore the FK to chats.id
    await queryInterface.changeColumn('messages', 'chat_id', {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Recreate the original foreign key constraint
    await queryInterface.addConstraint('messages', {
      fields: ['chat_id'],
      type: 'foreign key',
      name: 'messages_chat_id_fkey',
      references: {
        table: 'chats',
        field: 'id',
      },
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
    });
  },
}; 