"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("web_publics", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      currency_code: Sequelize.STRING,
      logo: Sequelize.STRING,
      app_name: Sequelize.STRING,
      custom_home: Sequelize.STRING,
      is_custom_home: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      meta_description: Sequelize.TEXT,
      currency_symbol: Sequelize.STRING,
      chatbot_screen_tutorial: Sequelize.STRING,
      broadcast_screen_tutorial: Sequelize.STRING,
      home_page_tutorial: Sequelize.STRING,
      login_header_footer: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      exchange_rate: Sequelize.STRING,
      google_client_id: Sequelize.STRING,
      google_login_active: {
        type: Sequelize.INTEGER,
        defaultValue: 1,
      },
      rtl: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      fb_login_app_id: Sequelize.STRING,
      fb_login_app_sec: Sequelize.STRING,
      fb_login_active: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      facebook_client_id: Sequelize.STRING,
      facebook_client_secret: Sequelize.STRING,
      facebook_graph_version: Sequelize.STRING,
      facebook_auth_scopes: Sequelize.TEXT,
      meta_webhook_verifcation_key: Sequelize.TEXT,
      instagram_client_id: Sequelize.STRING,
      instagram_client_secret: Sequelize.STRING,
      instagram_graph_version: Sequelize.STRING,
      instagram_auth_scopes: Sequelize.TEXT,
      whatsapp_client_id: Sequelize.STRING,
      whatsapp_client_secret: Sequelize.STRING,
      whatsapp_graph_version: Sequelize.STRING,
      whatsapp_config_id: Sequelize.TEXT,
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("web_publics");
  },
};
