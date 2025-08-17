"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("messages", "timestamp", {
      type: Sequelize.BIGINT,
      allowNull: true,
    });
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.changeColumn("messages", "timestamp", {
      type: Sequelize.INTEGER,
      allowNull: true,
    });
  },
};
