"use strict";
const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class WebPublic extends Model {
    static associate(models) {
      // define association here if needed
    }
  }

  WebPublic.init(
    {
      currency_code: DataTypes.STRING,
      logo: DataTypes.STRING,
      app_name: DataTypes.STRING,
      custom_home: DataTypes.STRING,
      is_custom_home: DataTypes.INTEGER,
      meta_description: DataTypes.TEXT,
      currency_symbol: DataTypes.STRING,
      chatbot_screen_tutorial: DataTypes.STRING,
      broadcast_screen_tutorial: DataTypes.STRING,
      home_page_tutorial: DataTypes.STRING,
      login_header_footer: DataTypes.INTEGER,
      exchange_rate: DataTypes.STRING,
      google_client_id: DataTypes.STRING,
      google_login_active: DataTypes.INTEGER,
      rtl: DataTypes.INTEGER,
      fb_login_app_id: DataTypes.STRING,
      fb_login_app_sec: DataTypes.STRING,
      fb_login_active: DataTypes.INTEGER,
      facebook_client_id: DataTypes.STRING,
      facebook_client_secret: DataTypes.STRING,
      facebook_graph_version: DataTypes.STRING,
      facebook_auth_scopes: DataTypes.TEXT,
      meta_webhook_verifcation_key: DataTypes.TEXT,
      instagram_client_id: DataTypes.STRING,
      instagram_client_secret: DataTypes.STRING,
      instagram_graph_version: DataTypes.STRING,
      instagram_auth_scopes: DataTypes.TEXT,
      whatsapp_client_id: DataTypes.STRING,
      whatsapp_client_secret: DataTypes.STRING,
      whatsapp_graph_version: DataTypes.STRING,
      whatsapp_config_id: DataTypes.TEXT,
    },
    {
      sequelize,
      modelName: "WebPublic",
      tableName: "web_publics",
    }
  );

  return WebPublic;
};
