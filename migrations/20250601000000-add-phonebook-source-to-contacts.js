"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    const table = await queryInterface.describeTable("contacts");
    if (!table.phonebook_id) {
      await queryInterface.addColumn("contacts", "phonebook_id", {
        type: Sequelize.INTEGER,
        allowNull: true,
      });
    }
    if (!table.source) {
      await queryInterface.addColumn("contacts", "source", {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },
  async down(queryInterface) {
    const table = await queryInterface.describeTable("contacts");
    if (table.phonebook_id) await queryInterface.removeColumn("contacts", "phonebook_id");
    if (table.source) await queryInterface.removeColumn("contacts", "source");
  },
};
