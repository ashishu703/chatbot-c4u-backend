"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn("drip_campaign_messages", "time_interval_enabled", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    await queryInterface.addColumn("drip_campaign_messages", "start_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("drip_campaign_messages", "end_time", {
      type: Sequelize.TIME,
      allowNull: true,
    });

    await queryInterface.addColumn("drip_campaign_messages", "selected_days", {
      type: Sequelize.JSON,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("drip_campaign_messages", "time_interval_enabled");
    await queryInterface.removeColumn("drip_campaign_messages", "start_time");
    await queryInterface.removeColumn("drip_campaign_messages", "end_time");
    await queryInterface.removeColumn("drip_campaign_messages", "selected_days");
  },
};
