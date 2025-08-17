'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.removeColumn('contacts', 'var1');
    await queryInterface.removeColumn('contacts', 'var2');
    await queryInterface.removeColumn('contacts', 'var3');
    await queryInterface.removeColumn('contacts', 'var4');
    await queryInterface.removeColumn('contacts', 'var5');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.addColumn('contacts', 'var1', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('contacts', 'var2', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('contacts', 'var3', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('contacts', 'var4', {
      type: Sequelize.STRING,
      allowNull: true,
    });
    await queryInterface.addColumn('contacts', 'var5', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  }
};
