"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("messages", "message_id", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("messages", "message_id", {
      type: Sequelize.TEXT,
      allowNull: false,
    });
  },
};
