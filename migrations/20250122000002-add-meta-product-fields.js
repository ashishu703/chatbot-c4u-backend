"use strict";

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("products", "retailer_id", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("products", "availability", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "in stock",
    });

    await queryInterface.addColumn("products", "condition", {
      type: Sequelize.STRING,
      allowNull: true,
      defaultValue: "new",
    });

    await queryInterface.addColumn("products", "brand", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("products", "category", {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("products", "inventory", {
      type: Sequelize.INTEGER,
      allowNull: true,
      defaultValue: 0,
    });

    await queryInterface.addColumn("products", "url", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("products", "retailer_id");
    await queryInterface.removeColumn("products", "availability");
    await queryInterface.removeColumn("products", "condition");
    await queryInterface.removeColumn("products", "brand");
    await queryInterface.removeColumn("products", "category");
    await queryInterface.removeColumn("products", "inventory");
    await queryInterface.removeColumn("products", "url");
  },
};
