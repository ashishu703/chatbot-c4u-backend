const {WebPublic} = require('../models');

module.exports = {
  async findFirst() {
    let config = await WebPublic.findOne({ where: { id: 1 } });
    if (!config) {
      config = await WebPublic.create({
        currency_code: 'USD',
        logo: '',
        app_name: 'MyApp',
        custom_home: '',
        is_custom_home: 0,
        meta_description: 'Default meta description',
        currency_symbol: '$',
        chatbot_screen_tutorial: '',
        broadcast_screen_tutorial: '',
        home_page_tutorial: '',
        login_header_footer: 0,
        exchange_rate: '1',
        facebook_client_id: '',
        facebook_client_secret: '',
        facebook_graph_version: '',
        facebook_auth_scopes: '',
        meta_webhook_verifcation_key: '',
        instagram_client_id: '',
        instagram_client_secret: '',
        instagram_graph_version: '',
        instagram_auth_scopes: '',
        whatsapp_client_id: '',
        whatsapp_client_secret: '',
        whatsapp_graph_version: '',
        config_id: ''
      });
    }

    return config;
  },

  async update(id, data) {
    const config = await WebPublic.findByPk(id);
    if (!config) return null;
    await config.update(data);
    return config;
  }
};

