const webConfigRepository = require('../repositories/webConfigRepository');
const { getFileExtension } = require('../utils/validation');
const path = require('path');
const randomstring = require('randomstring');

class WebConfigService {
  async updateWebConfig(req) {
    const {
      app_name,
      custom_home,
      is_custom_home,
      meta_description,
      currency_code,
      currency_symbol,
      home_page_tutorial,
      chatbot_screen_tutorial,
      broadcast_screen_tutorial,
      login_header_footer,
      exchange_rate,
      facebook_client_id,
      facebook_client_secret,
      facebook_graph_version,
      facebook_auth_scopes,
      meta_webhook_verifcation_key,
      instagram_client_id,
      instagram_client_secret,
      instagram_graph_version,
      instagram_auth_scopes,
      whatsapp_client_id,
      whatsapp_client_secret,
      whatsapp_graph_version,
      config_id
    } = req.body;

    let filename = req.body.logo || '';

    if (req.files?.file) {
      const file = req.files.file;
      const randomName = randomstring.generate();
      filename = `${randomName}.${getFileExtension(file.name)}`;
      const savePath = path.join(__dirname, '..', 'client', 'public', 'media', filename);

      await new Promise((resolve, reject) => {
        file.mv(savePath, (err) => {
          if (err) reject(err);
          else resolve();
        });
      });
    }

    if (!app_name) throw new Error('Please provide app name');

    const configData = {
      logo: filename,
      app_name,
      custom_home,
      is_custom_home: parseInt(is_custom_home) || 0,
      meta_description,
      currency_code,
      currency_symbol,
      home_page_tutorial,
      chatbot_screen_tutorial,
      broadcast_screen_tutorial,
      login_header_footer: parseInt(login_header_footer) || 0,
      exchange_rate: exchange_rate || '',
      facebook_client_id,
      facebook_client_secret,
      facebook_graph_version,
      facebook_auth_scopes,
      meta_webhook_verifcation_key,
      instagram_client_id,
      instagram_client_secret,
      instagram_graph_version,
      instagram_auth_scopes,
      whatsapp_client_id,
      whatsapp_client_secret,
      whatsapp_graph_version,
      config_id
    };

    // ✅ Remove undefined values to prevent PostgreSQL errors
    const cleanedData = Object.fromEntries(
      Object.entries(configData).filter(([_, v]) => v !== undefined)
    );

    const updated = await webConfigRepository.update(1, cleanedData);
    if (!updated) throw new Error('Web config not found');
    return updated;
  }

  async getWebPublic() {
    const config = await webConfigRepository.findFirst();
    if (!config) throw new Error('Web config not found');
    return config;
  }
}

module.exports = new WebConfigService();
