"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    // Drop FK if present
    await queryInterface.sequelize.query(
      'ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_chat_id_fkey";'
    );

    // Cast existing values to integer before changing type
    await queryInterface.sequelize.query(
      'ALTER TABLE "messages" ALTER COLUMN "chat_id" TYPE INTEGER USING (NULLIF(TRIM("chat_id"::text), \'\')::integer);'
    );

    // Ensure not null
    await queryInterface.changeColumn("messages", "chat_id", {
      type: Sequelize.INTEGER,
      allowNull: false,
    });

    // Recreate the FK to chats.id
    await queryInterface.addConstraint("messages", {
      fields: ["chat_id"],
      type: "foreign key",
      name: "messages_chat_id_fkey",
      references: {
        table: "chats",
        field: "id",
      },
      onDelete: "CASCADE",
      onUpdate: "CASCADE",
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(
      'ALTER TABLE "messages" DROP CONSTRAINT IF EXISTS "messages_chat_id_fkey";'
    );
    await queryInterface.changeColumn("messages", "chat_id", {
      type: Sequelize.STRING,
      allowNull: false,
    });
  },
};


