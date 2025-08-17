"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("chats", "platform", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "messenger", // fallback for existing rows
    });
    await queryInterface.addColumn("chats", "last_message_timestamp", {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("chats", "platform");
    await queryInterface.removeColumn("chats", "last_message_timestamp");
  },
};
