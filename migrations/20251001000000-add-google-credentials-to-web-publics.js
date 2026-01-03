"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("web_publics", "google_client_secret", {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn("web_publics", "google_redirect_uri", {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("web_publics", "google_client_secret");
    await queryInterface.removeColumn("web_publics", "google_redirect_uri");
  },
};

